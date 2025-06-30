// routes/user.js
const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const { usersContainer } = require('../db');

const upload = multer();
const router = express.Router();

router.get('/', async (req, res) => {
  // You could list all users here, but for now just return a simple JSON to prove the route is alive:
  res.json({ status: 'ok', message: 'Users endpoint is up!' });
});

// UPLOAD PROFILE IMAGE
router.post('/upload-profile-image', upload.single('image'), async (req, res) => {
  const { username } = req.body;
  if (!username || !req.file) {
    return res.status(400).json({ error: 'Missing username or image.' });
  }
  try {
    const blobClient = BlobServiceClient
      .fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
      .getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME)
      .getBlockBlobClient(`${username}-${uuidv4()}.jpg`);

    await blobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });
    const imageUrl = blobClient.url;

    const { resources } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.username=@u',
        parameters: [{ name: '@u', value: username }]
      }).fetchAll();
    if (!resources.length) return res.status(404).json({ error: 'User not found.' });

    const user = resources[0];
    user.profileImage = imageUrl;
    await usersContainer.items.upsert(user, { partitionKey: username });

    res.json({ message: 'Image uploaded.', imageUrl });
  } catch (err) {
    console.error('❌ Upload-profile-image error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET USER BY EMAIL
router.get('/get', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required.' });
  try {
    const { resources } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.email=@e',
        parameters: [{ name: '@e', value: email }]
      }).fetchAll();
    if (!resources.length) return res.status(404).json({ error: 'User not found.' });

    const u = resources[0];
    res.json({
     user: {
       firstName: u.firstName,
       lastName: u.lastName,
       username: u.username,
       email: u.email,
       dob: u.dob,
       gender: u.gender,
       createdAt: u.createdAt,
       role: u.role,                               // ← include role
       organizerData: u.organizerData || null,     // ← optional organizer info
       location: u.location || '',
       profileImage: u.profileImage || '',
       followers: u.followers || [],
       following: u.following || [],
     }
   });
  } catch (err) {
    console.error('❌ Get-user error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET USER BY USERNAME
router.get('/by-username', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Username required.' });
  try {
    const { resources } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.username=@u',
        parameters: [{ name: '@u', value: username }]
      }).fetchAll();
    if (!resources.length) return res.status(404).json({ error: 'User not found.' });

    const u = resources[0];
    res.json({
     user: {
       firstName: u.firstName,
       lastName: u.lastName,
       username: u.username,
       _id: u.id || u._id,
       email: u.email,
       dob: u.dob,
       gender: u.gender,
       createdAt: u.createdAt,
       role: u.role,                               // ← include role
       organizerData: u.organizerData || null,     // ← optional organizer info
       location: u.location || '',
       profileImage: u.profileImage || '',
       followers: u.followers || [],
       following: u.following || [],
     }
   });
  } catch (err) {
    console.error('❌ By-username error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// UPDATE PROFILE IMAGE URL
router.post('/profile-image', async (req, res) => {
  const { username, imageUri } = req.body;
  if (!username || !imageUri) {
    return res.status(400).json({ error: 'Missing username or imageUri.' });
  }
  try {
    const { resources } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.username=@u',
        parameters: [{ name: '@u', value: username }]
      }).fetchAll();
    if (!resources.length) return res.status(404).json({ error: 'User not found.' });

    const user = resources[0];
    user.profileImage = imageUri;
    await usersContainer.items.upsert(user, { partitionKey: username });
    res.json({ message: 'Profile image updated.' });
  } catch (err) {
    console.error('❌ Profile-image error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// FOLLOW / UNFOLLOW
router.post('/follow', async (req, res) => {
  const { followerUsername, followeeUsername } = req.body;
  if (!followerUsername || !followeeUsername || followerUsername === followeeUsername) {
    return res.status(400).json({ error: 'Invalid follow request.' });
  }
  try {
    const { resources } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.username IN (@f, @e)',
        parameters: [
          { name: '@f', value: followerUsername },
          { name: '@e', value: followeeUsername }
        ]
      }).fetchAll();

    const follower = resources.find(u => u.username === followerUsername);
    const followee = resources.find(u => u.username === followeeUsername);
    if (!follower || !followee) return res.status(404).json({ error: 'User(s) not found.' });

    follower.following = Array.from(new Set([...(follower.following || []), followeeUsername]));
    followee.followers = Array.from(new Set([...(followee.followers || []), followerUsername]));

    await usersContainer.items.upsert(follower, { partitionKey: followerUsername });
    await usersContainer.items.upsert(followee, { partitionKey: followeeUsername });

    res.json({ message: 'Follow successful.' });
  } catch (err) {
    console.error('❌ Follow error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/unfollow', async (req, res) => {
  const { followerUsername, followeeUsername } = req.body;
  if (!followerUsername || !followeeUsername || followerUsername === followeeUsername) {
    return res.status(400).json({ error: 'Invalid unfollow request.' });
  }
  try {
    const { resources } = await usersContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.username IN (@f, @e)',
        parameters: [
          { name: '@f', value: followerUsername },
          { name: '@e', value: followeeUsername }
        ]
      }).fetchAll();

    const follower = resources.find(u => u.username === followerUsername);
    const followee = resources.find(u => u.username === followeeUsername);
    if (!follower || !followee) return res.status(404).json({ error: 'User(s) not found.' });

    follower.following = (follower.following || []).filter(u => u !== followeeUsername);
    followee.followers = (followee.followers || []).filter(u => u !== followerUsername);

    await usersContainer.items.upsert(follower, { partitionKey: followerUsername });
    await usersContainer.items.upsert(followee, { partitionKey: followeeUsername });

    res.json({ message: 'Unfollow successful.' });
  } catch (err) {
    console.error('❌ Unfollow error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
