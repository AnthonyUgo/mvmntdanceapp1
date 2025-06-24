// routes/events.js
const express = require('express');
const { eventsContainer } = require('../db');

const router = express.Router();

// CREATE or UPDATE EVENT
router.post('/', async (req, res) => {
  const {
    id, title, date, startTime, endTime,
    venueName, venueAddress, price, quantity,
    collaborator, image, draft = false,
    tickets = [], organizerId
  } = req.body;

  if (!organizerId || !id || !title || !date || !startTime || !endTime || !venueName || !venueAddress) {
    return res.status(400).json({ error: 'Missing required event fields.' });
  }

  const eventData = {
    id, title, date, startTime, endTime,
    venueName, venueAddress, price, quantity,
    collaborator, image, draft, tickets, organizerId
  };

  try {
    const { resource } = await eventsContainer.items.upsert(eventData, { partitionKey: organizerId });
    res.json({ message: 'Event saved.', event: resource });
  } catch (err) {
    console.error('❌ Event save error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE EVENT
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

// GET ALL (by organizer)
router.get('/', async (req, res) => {
  const { organizerId, draft } = req.query;
  if (!organizerId) return res.status(400).json({ error: 'organizerId required.' });

  let query = 'SELECT * FROM c WHERE c.organizerId = @o';
  const params = [{ name: '@o', value: organizerId }];
  if (draft !== undefined) {
    query += ' AND c.draft = @d';
    params.push({ name: '@d', value: draft === 'true' });
  }

  try {
    const { resources } = await eventsContainer.items.query({ query, parameters: params }).fetchAll();
    res.json(resources);
  } catch (err) {
    console.error('❌ Fetch events error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET SINGLE
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

// PUBLIC EVENTS
router.get('/public', async (_req, res) => {
  try {
    const { resources } = await eventsContainer.items
      .query({ query: 'SELECT * FROM c WHERE c.draft = false' })
      .fetchAll();
    res.json({ events: resources });
  } catch (err) {
    console.error('❌ Fetch public events error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// SAVED EVENTS
router.post('/saved', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required.' });
  try {
    const { resources } = await eventsContainer.items
      .query({
        query: 'SELECT * FROM c WHERE ARRAY_CONTAINS(c.savedBy, @e)',
        parameters: [{ name: '@e', value: email }]
      }).fetchAll();
    res.json({ events: resources });
  } catch (err) {
    console.error('❌ Fetch saved events error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// TICKETED EVENTS
router.post('/tickets', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required.' });
  try {
    const { resources } = await eventsContainer.items
      .query({
        query: 'SELECT * FROM c WHERE EXISTS (SELECT VALUE t FROM t IN c.tickets WHERE t.email=@e)',
        parameters: [{ name: '@e', value: email }]
      }).fetchAll();
    res.json({ events: resources });
  } catch (err) {
    console.error('❌ Fetch ticketed events error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
