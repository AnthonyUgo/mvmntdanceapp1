const dotenv = require('dotenv');
dotenv.config();  // Make sure this is first!

const express = require('express');
const cors = require('cors');
const { CosmosClient } = require('@azure/cosmos');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log environment variables (useful for debugging)
console.log(`🔍 COSMOS_DB_URI: ${process.env.COSMOS_DB_URI ? 'Loaded' : 'Not found'}`);
console.log(`🔍 COSMOS_DB_KEY: ${process.env.COSMOS_DB_KEY ? 'Loaded' : 'Not found'}`);
console.log(`🔍 COSMOS_DB_DATABASE: ${process.env.COSMOS_DB_DATABASE ? 'Loaded' : 'Not found'}`);
console.log(`🔍 COSMOS_DB_CONTAINER: ${process.env.COSMOS_DB_CONTAINER ? 'Loaded' : 'Not found'}`);

// Cosmos DB Setup 
const client = new CosmosClient({
  endpoint: process.env.COSMOS_DB_URI,
  key: process.env.COSMOS_DB_KEY,
});
// Routes
app.use('/api/auth', authRoutes);

// Fallback root route for testing
app.get('/', (req, res) => {
  res.send('MVMNT Backend is running.');
});

// Server Listen
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Global error handlers (catch unhandled promise rejections and exceptions)
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception thrown:', err);
});

(async () => {
  try {
    const containers = await client.database(process.env.COSMOS_DB_DATABASE).containers.readAll().fetchAll();
    console.log("✅ Containers found:", containers.resources.map(c => c.id));
  } catch (err) {
    console.error("❌ Could not list containers:", err);
  }
})();