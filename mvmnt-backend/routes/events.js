// routes/events.js
const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
const { eventsContainer } = require('../db');

const router = express.Router();
const upload = multer(); // ← this defines `upload.single('image')`

// ───────────────
// 1) UPLOAD EVENT IMAGE
// POST /api/events/upload-image
router.post(
  '/upload-image',
  upload.single('image'),
  async (req, res) => {
    const { eventId } = req.body;
    if (!eventId || !req.file) {
      return res.status(400).json({ error: 'Missing eventId or image file.' });
    }

    try {
      // use your existing storage container name
      const containerClient = BlobServiceClient
        .fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING)
        .getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);

      // prefix under "event-images/"
      const blobName = `event-images/${eventId}-${uuidv4()}.jpg`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // upload buffer
      await blockBlobClient.uploadData(req.file.buffer, {
        blobHTTPHeaders: { blobContentType: req.file.mimetype }
      });

      res.json({ imageUrl: blockBlobClient.url });
    } catch (err) {
      console.error('❌ Event image upload error:', err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// ───────────────
// 2) CREATE or UPDATE EVENT
// POST /api/events
router.post('/', async (req, res) => {
  const {
    id, title, collaborators, description, startDate, endDate, startTime, endTime,
    venueName, venueAddress, price, quantity,
    collaborator, image, draft = false,
    tickets = [], visibility, shareCode, organizerId
  } = req.body;

  if (
    !organizerId ||
    !id || !title || !startDate || !startTime || !endTime ||
    !venueName || !venueAddress
  ) {
    return res.status(400).json({ error: 'Missing required event fields.' });
  }

  const eventData = {
    id,
    title,
    description,
    startDate,
    endDate,
    startTime,
    endTime,
    venueName,
    venueAddress,
    price,
    quantity,
    collaborator,
    image,
    draft,
    collaborators,
    visibility,   // "public" or "private"
    shareCode,    // null or code
    tickets,
    organizerId
  };

  try {
    const { resource } = await eventsContainer
      .items.upsert(eventData, { partitionKey: organizerId });
    res.json({ message: 'Event saved.', event: resource });
  } catch (err) {
    console.error('❌ Event save error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ───────────────
// 3) DELETE EVENT
// DELETE /api/events/:id?organizerId=...
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { organizerId } = req.query;
  if (!organizerId) {
    return res.status(400).json({ error: 'organizerId required.' });
  }
  try {
    await eventsContainer.item(id, organizerId).delete();
    res.json({ message: 'Event deleted.' });
  } catch (err) {
    console.error('❌ Delete event error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ───────────────
// 3.4) PUBLIC EVENTS
// GET /api/events
//  • ?organizerId=… → organizer’s events
//  • (no organizerId) → all public events (filterable by ?city=…)
router.get('/', async (req, res) => {
  const { organizerId, draft, city } = req.query;
  try {
    if (organizerId) {
      // organizer’s events
      let sql    = 'SELECT * FROM c WHERE c.organizerId = @o';
      const params = [{ name: '@o', value: organizerId }];
      if (draft !== undefined) {
        sql += ' AND c.draft = @d';
        params.push({ name: '@d', value: draft === 'true' });
      }
      const { resources } = await eventsContainer
        .items.query({ query: sql, parameters: params })
        .fetchAll();
      return res.json(resources);
    } else {
      // public discover events
      let sql    = 'SELECT * FROM c WHERE c.draft = false';
      const params = [];
      if (city) {
        sql += ' AND c.venueCity = @city';
        params.push({ name: '@city', value: city });
      }
      const { resources } = await eventsContainer
        .items.query({ query: sql, parameters: params })
        .fetchAll();
      return res.json({ events: resources });
    }
  } catch (err) {
    console.error('❌ Fetch events error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});

// ───────────────
// 5) GET SINGLE EVENT
// GET /api/events/:id?organizerId=...
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { organizerId } = req.query;
  if (!organizerId) return res.status(400).json({ error: 'organizerId required.' });

  try {
    const { resource } = await eventsContainer.item(id, organizerId).read();
    if (!resource) return res.status(404).json({ error: 'Not found.' });
    res.json(resource);
  } catch (err) {
    console.error('❌ Fetch event error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});


// ───────────────
// 7) SAVED EVENTS
// POST /api/events/saved
router.post('/saved', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required.' });
  try {
    const { resources } = await eventsContainer.items
      .query({
        query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.savedBy, @e)',
        parameters: [{ name: '@e', value: email }]
      })
      .fetchAll();
    res.json({ events: resources });
  } catch (err) {
    console.error('❌ Fetch saved events error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ───────────────
// 8) TICKETED EVENTS
// POST /api/events/tickets
router.post('/tickets', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required.' });
  try {
    const { resources } = await eventsContainer.items
      .query({
        query: 'SELECT * FROM c WHERE EXISTS (SELECT VALUE t FROM t IN c.tickets WHERE t.email=@e)',
        parameters: [{ name: '@e', value: email }]
      })
      .fetchAll();
    res.json({ events: resources });
  } catch (err) {
    console.error('❌ Fetch ticketed events error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
