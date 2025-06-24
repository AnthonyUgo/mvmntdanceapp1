// db.js
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_DB_URI;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE;
const usersContainerId = process.env.COSMOS_DB_CONTAINER;
const eventsContainerId = process.env.COSMOS_DB_CONTAINER_EVENTS;

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);

const usersContainer = database.container(usersContainerId);
const eventsContainer = database.container(eventsContainerId);

module.exports = { client, usersContainer, eventsContainer };
