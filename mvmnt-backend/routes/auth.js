const express = require('express');
const bcrypt = require('bcryptjs');
const { CosmosClient } = require('@azure/cosmos');
const router = express.Router();

console.log("🔍 COSMOS_DB_URI:", process.env.COSMOS_DB_URI);
console.log("🔍 COSMOS_DB_KEY:", process.env.COSMOS_DB_KEY ? "Loaded" : "Missing");

// Cosmos DB Setup
const client = new CosmosClient({
  endpoint: process.env.COSMOS_DB_URI,
  key: process.env.COSMOS_DB_KEY,
});
const database = client.database(process.env.COSMOS_DB_DATABASE);
const container = database.container(process.env.COSMOS_DB_CONTAINER);

// =============================
// REGULAR USER SIGNUP
// =============================
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    // Check if user exists
    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.email = @email',
        parameters: [{ name: '@email', value: email }],
      })
      .fetchAll();

    if (resources.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = {
      id: email,
      email,
      password: hashedPassword,
      role: 'user'
    };

    await container.items.create(newUser);

    res.status(201).json({ message: 'User created successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================
// REGULAR USER LOGIN
// =============================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.email = @email',
        parameters: [{ name: '@email', value: email }],
      })
      .fetchAll();

    if (resources.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = resources[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful!', role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================
// ORGANIZER SIGNUP
// =============================

router.post('/organizer/signup', async (req, res) => {
  console.log('Incoming signup request:', req.body);
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    dob,
    gender
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !username || !email || !password || !dob || !gender) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  try {
    // Check if email or username exists
    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.email = @email OR c.username = @username',
        parameters: [
          { name: '@email', value: email },
          { name: '@username', value: username }
        ],
      })
      .fetchAll();

    if (resources.length > 0) {
      return res.status(400).json({ error: 'Email or username already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save organizer user
    const newOrganizer = {
      id: email,
      firstName,
      lastName,
      username: username,
      email,
      password: hashedPassword,
      dob,
      gender,
      role: 'organizer'
    };

    await container.items.create(newOrganizer, { partitionKey: username });

    res.status(201).json({ message: 'Organizer account created successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/organizer/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  try {
    const { resources } = await container.items
      .query({
        query: 'SELECT * FROM c WHERE c.email = @email AND c.role = @role',
        parameters: [
          { name: '@email', value: email },
          { name: '@role', value: 'organizer' }
        ]
      })
      .fetchAll();

    if (resources.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const organizer = resources[0];
    const isMatch = await bcrypt.compare(password, organizer.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    res.status(200).json({ message: 'Login successful!', role: organizer.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
