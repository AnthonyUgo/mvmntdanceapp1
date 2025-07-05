const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();
const { usersContainer } = require('../db'); 
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// ========== 1. CREATE OR RETURN STRIPE ACCOUNT ========== //
router.post('/create-stripe-account', async (req, res) => {
  const { email } = req.body;

  try {
    const { resources } = await usersContainer.items.query({
      query: 'SELECT * FROM c WHERE c.email=@e',
      parameters: [{ name: '@e', value: email }]
    }).fetchAll();

    if (!resources.length) return res.status(404).json({ error: 'User not found' });

    const user = resources[0];

    if (user.stripeAccountId) {
      const loginLink = await stripe.accounts.createLoginLink(user.stripeAccountId);
      return res.json({ alreadyConnected: true, loginLink: loginLink.url });
    }

    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: { transfers: { requested: true } },
    });

    user.stripeAccountId = account.id;
    await usersContainer.items.upsert(user, { partitionKey: user.username });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'https://mvmntdanceapp.azurestaticapps.net/organizer/stripe-error',
      return_url: 'https://mvmntdanceapp.azurestaticapps.net/organizer/account',
      type: 'account_onboarding',
    });

    res.json({ onboardingUrl: accountLink.url });
  } catch (err) {
    console.error('❌ Stripe Account Error:', err);
    res.status(500).json({ error: 'Stripe account setup failed', details: err.message });
  }
});

// ========== 2. CREATE CHECKOUT SESSION ========== //
router.post('/create-checkout-session', async (req, res) => {
  const { organizerId, eventId, ticketPrice, platformFeeAmount } = req.body;

  try {
    const { resources } = await usersContainer.items.query({
      query: 'SELECT * FROM c WHERE c.id=@id',
      parameters: [{ name: '@id', value: organizerId }]
    }).fetchAll();

    const organizer = resources[0];
    if (!organizer?.stripeAccountId) {
      return res.status(400).json({ error: 'Organizer Stripe account not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Event Ticket' },
          unit_amount: ticketPrice,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `https://mvmntdanceapp.azurestaticapps.net/success?eventId=${eventId}`,
      cancel_url: 'https://mvmntdanceapp.azurestaticapps.net/cancel',
      payment_intent_data: {
        application_fee_amount: platformFeeAmount,
        transfer_data: {
          destination: organizer.stripeAccountId,
        },
      },
      customer_email: req.body.email,
      metadata: {
      eventId,  
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Checkout Session Error:', err);
    res.status(500).json({ error: 'Checkout session creation failed', details: err.message });
  }
});

// ========== 3. WEBHOOK ========== //
const rawWebhook = express.raw({ type: 'application/json' });

const webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('⚠️ Webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_email;
    const eventId = session.metadata?.eventId;

    console.log('✅ Checkout complete:', session.id);

    try {
      const { resources } = await usersContainer.items
        .query({
          query: 'SELECT * FROM c WHERE c.email=@e',
          parameters: [{ name: '@e', value: customerEmail }]
        }).fetchAll();

      if (!resources.length) {
        console.warn('⚠️ User not found for ticket purchase');
        return res.status(404).json({ error: 'User not found' });
      }

      const user = resources[0];
      user.tickets = user.tickets || [];

      user.tickets.push({
        eventId,
        sessionId: session.id,
        purchasedAt: new Date().toISOString(),
        status: 'confirmed',
      });

      await usersContainer.items.upsert(user, { partitionKey: user.username });

      console.log(`🎟️ Ticket stored for ${customerEmail} - Event: ${eventId}`);
    } catch (err) {
      console.error('❌ Error saving ticket in Cosmos DB:', err);
    }
  }

  res.status(200).json({ received: true });
};


// ========== 4. STRIPE LOGIN LINK ========== //
router.post('/stripe-login-link', async (req, res) => {
  const { email } = req.body;

  try {
    const { resources } = await usersContainer.items.query({
      query: 'SELECT * FROM c WHERE c.email=@e',
      parameters: [{ name: '@e', value: email }]
    }).fetchAll();

    const user = resources[0];
    if (!user?.stripeAccountId) return res.status(400).json({ error: 'Stripe account not connected' });

    const loginLink = await stripe.accounts.createLoginLink(user.stripeAccountId);
    res.json({ url: loginLink.url });
  } catch (err) {
    console.error('Login link error:', err);
    res.status(500).json({ error: 'Login link failed', details: err.message });
  }
});

// ========== 5. ORGANIZER EARNINGS ========== //
router.get('/earnings/:organizerId', async (req, res) => {
  const { organizerId } = req.params;

  try {
    const { resources } = await usersContainer.items.query({
      query: 'SELECT * FROM c WHERE c.id=@id',
      parameters: [{ name: '@id', value: organizerId }]
    }).fetchAll();

    const user = resources[0];
    if (!user?.stripeAccountId) {
      return res.status(400).json({ error: 'Stripe account not found' });
    }

    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripeAccountId,
    });

    res.json({ balance });
  } catch (err) {
    console.error('Earnings fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

module.exports = {
  router,
  rawWebhook,
  webhookHandler,
};
