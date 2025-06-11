const express = require('express');
const router = express.Router();
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_DB_URI;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE;
const containerId = process.env.COSMOS_DB_CONTAINER;
const partitionKeyField = process.env.COSMOS_DB_PARTITION_KEY || undefined;

const client = new CosmosClient({ endpoint, key });
const container = client.database(databaseId).container(containerId);

// Save or Update Event
router.post('/', async (req, res) => {
  try {
    const eventData = req.body;

    if (!eventData.id) {
      return res.status(400).json({ error: 'Event ID is required.' });
    }

    if (partitionKeyField && !eventData[partitionKeyField]) {
      return res.status(400).json({ error: `Missing partition key: ${partitionKeyField}` });
    }

    await container.items.upsert(eventData);
    res.status(200).json({ message: 'Event saved/updated successfully.' });
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ error: 'Failed to save/update event.' });
  }
});

// Delete Event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const partitionKey = req.query.partitionKey;

    if (partitionKeyField && !partitionKey) {
      return res.status(400).json({ error: `Partition key is required to delete this event.` });
    }

    if (partitionKeyField) {
      await container.item(id, partitionKey).delete();
    } else {
      await container.item(id).delete();
    }

    res.status(200).json({ message: 'Event deleted successfully.' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

// Get All Events (optional filter by draft)
router.get('/', async (req, res) => {
  try {
    const { draft } = req.query;
    let querySpec = { query: 'SELECT * FROM c', parameters: [] };

    if (draft !== undefined) {
      querySpec.query += ' WHERE c.draft = @draft';
      querySpec.parameters.push({ name: '@draft', value: draft === 'true' });
    }

    const { resources: events } = await container.items.query(querySpec).fetchAll();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// Get Single Event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const partitionKey = req.query.partitionKey;

    const item = partitionKeyField ? container.item(id, partitionKey) : container.item(id);
    const { resource } = await item.read();

    if (!resource) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    res.status(200).json(resource);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event.' });
  }
});

// Public Route - Live Events Only
router.get('/public', async (req, res) => {
  try {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.draft = false',
      parameters: []
    };

    const { resources: events } = await container.items.query(querySpec).fetchAll();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching live events:', error);
    res.status(500).json({ error: 'Failed to fetch live events.' });
  }
});

module.exports = router;