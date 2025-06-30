// routes/payments.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User'); // Update with your actual User model

// ========== 1. CREATE OR RETURN STRIPE ACCOUNT ========== //
router.post('/create-stripe-account', async (req, res) => {
  const { email } = req.body;

  try {
    // 1. Find the user by email
    const { resources } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.email=@e',
        parameters: [{ name: '@e', value: email }]
      }).fetchAll();

    if (!resources.length) return res.status(404).json({ error: 'User not found' });

    const user = resources[0];

    console.log('[Stripe] Email (userId):', userId);
    console.log('[Stripe] ENV Key starts with:', process.env.STRIPE_SECRET_KEY?.slice(0, 10));


    // 2. If they already have a Stripe account, return login link
    if (user.stripeAccountId) {
      const loginLink = await stripe.accounts.createLoginLink(user.stripeAccountId);
      return res.json({ alreadyConnected: true, loginLink: loginLink.url });
    }

    // 3. Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: { transfers: { requested: true } },
    });

    // 4. Save the Stripe account ID back to user
    user.stripeAccountId = account.id;
    await usersContainer.items.upsert(user, { partitionKey: user.username });

    // 5. Generate onboarding link
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


// ========== 2. CREATE CHECKOUT SESSION FOR TICKET PURCHASE ========== //
router.post('/create-checkout-session', async (req, res) => {
  const {
    organizerId,        // your user ID for the organizer
    eventId,            // optional: for logging or redirect params
    ticketPrice,        // in cents (e.g. $20 = 2000)
    platformFeeAmount   // in cents (e.g. $3 = 300)
  } = req.body;

  try {
    const organizer = await User.findById(organizerId);
    if (!organizer || !organizer.stripeAccountId) {
      return res.status(400).json({ error: 'Organizer Stripe account not found' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Event Ticket',
            },
            unit_amount: ticketPrice,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://mvmntdanceapp.azurestaticapps.net/success?eventId=${eventId}`,
      cancel_url: 'https://mvmntdanceapp.azurestaticapps.net/cancel',
      payment_intent_data: {
        application_fee_amount: platformFeeAmount, // 👈 your cut
        transfer_data: {
          destination: organizer.stripeAccountId, // 👈 organizer gets rest
        },
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Checkout Session Error:', err);
    res.status(500).json({ error: 'Checkout session creation failed', details: err.message });
  }
});

module.exports = router;
