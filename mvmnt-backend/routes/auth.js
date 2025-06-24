// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { usersContainer } = require('../db');

const router = express.Router();

// SIGNUP
router.post('/signup', async (req, res) => {
  const { firstName, lastName, username, email, password, dob, gender, accountType, address } = req.body;
  if (!firstName || !lastName || !username || !email || !password || !dob || !gender || !accountType) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (accountType === 'organizer' && !address) {
    return res.status(400).json({ error: 'Organizer address is required.' });
  }
  try {
    const { resources } = await usersContainer.items
      .query({
        query: 'SELECT c.id, c.username, c.email FROM c WHERE c.email=@e OR c.username=@u',
        parameters: [{ name: '@e', value: email }, { name: '@u', value: username }]
      }).fetchAll();

    if (resources.length) {
      return res.status(400).json({ error: 'Email or username already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      id: email,
      firstName,
      lastName,
      username,
      email,
      password: hashed,
      dob,
      gender,
      role: accountType,
      createdAt: new Date().toISOString(),
      verified: accountType === 'organizer' ? false : true,
      verificationToken: accountType === 'organizer'
        ? crypto.randomBytes(32).toString('hex') : null,
      ...(accountType === 'organizer' && {
        organizerData: { address, stripePayoutId: '', stripePaymentMethodId: '', events: [] }
      })
    };

    await usersContainer.items.create(newUser, { partitionKey: username });
    res.status(201).json({ message: 'Account created. Verification email sent if organizer.' });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// EMAIL VERIFICATION
router.post('/verify', async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) return res.status(400).json({ error: 'Missing email or token.' });
  try {
    const { resources } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.email=@e AND c.verificationToken=@t',
        parameters: [{ name: '@e', value: email }, { name: '@t', value: token }]
      }).fetchAll();
    if (!resources.length) return res.status(400).json({ error: 'Invalid token.' });

    const user = resources[0];
    user.verified = true;
    user.verificationToken = null;
    await usersContainer.items.upsert(user, { partitionKey: user.username });
    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    console.error('❌ Verify error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields.' });
  try {
    const { resources } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.email=@e',
        parameters: [{ name: '@e', value: email }]
      }).fetchAll();
    if (!resources.length) return res.status(400).json({ error: 'Invalid credentials.' });

    const user = resources[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials.' });
    if (user.role === 'organizer' && !user.verified) {
      return res.status(403).json({ error: 'Please verify your email.' });
    }

    const role = user.role || 'user';
    if (role === 'organizer' && !user.organizerData) {
      user.organizerData = { address: '', stripePayoutId: '', stripePaymentMethodId: '', events: [] };
      await usersContainer.items.upsert(user, { partitionKey: user.username });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        dob: user.dob,
        gender: user.gender,
        createdAt: user.createdAt,
        role,
        ...(role === 'organizer' && { organizerData: user.organizerData })
      }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required.' });
  try {
    const { resources } = await usersContainer.items
      .query({ query: 'SELECT * FROM c WHERE c.email=@e', parameters: [{ name: '@e', value: email }] })
      .fetchAll();
    if (!resources.length) return res.status(404).json({ error: 'Email not found.' });

    const user = resources[0];
    user.resetToken = crypto.randomBytes(32).toString('hex');
    user.resetExpires = Date.now() + 15 * 60 * 1000;
    await usersContainer.items.upsert(user, { partitionKey: user.username });

    res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    console.error('❌ Forgot-password error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    return res.status(400).json({ error: 'Missing fields.' });
  }
  try {
    const { resources } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.email=@e AND c.resetToken=@t',
        parameters: [{ name: '@e', value: email }, { name: '@t', value: token }]
      }).fetchAll();
    if (!resources.length) return res.status(400).json({ error: 'Invalid or expired token.' });

    const user = resources[0];
    if (Date.now() > user.resetExpires) {
      return res.status(400).json({ error: 'Token expired.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetExpires = null;
    await usersContainer.items.upsert(user, { partitionKey: user.username });
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    console.error('❌ Reset-password error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// BECOME ORGANIZER
router.post('/become-organizer', async (req, res) => {
  const { username, address } = req.body;
  if (!username || !address) {
    return res.status(400).json({ error: 'Username and address required.' });
  }
  try {
    const { resources } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.username=@u',
        parameters: [{ name: '@u', value: username }]
      }).fetchAll();
    if (!resources.length) return res.status(404).json({ error: 'User not found.' });
    const user = resources[0];
    if (user.role === 'organizer') {
      return res.status(400).json({ error: 'Already an organizer.' });
    }

    user.role = 'organizer';
    user.verified = false;
    user.verificationToken = crypto.randomBytes(32).toString('hex');
    user.organizerData = { address, stripePayoutId: '', stripePaymentMethodId: '', events: [] };
    await usersContainer.items.upsert(user, { partitionKey: user.username });

    res.json({ message: 'Upgrade initiated. Check email to verify.' });
  } catch (err) {
    console.error('❌ Become-organizer error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
