// backend/db/cosmosClient.js

const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_ENDPOINT; // stored in .env
const key = process.env.COSMOS_KEY;           // stored in .env
const databaseId = 'mvmntdanceapp';           // use your database name

const client = new CosmosClient({ endpoint, key });

async function getDatabase() {
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  return database;
}

module.exports = {
  client,
  getDatabase
};
