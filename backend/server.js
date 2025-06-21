// backend/server.js

// --- Imports ---
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initializeDatabase } = require('./db_setup');
const pool = require('./db'); // Import the shared pool

// --- Route Imports ---
const authRoutes = require('./routes/auth');
const agentRoutes = require('./routes/agents');
const dataRoutes = require('./routes/data');

// --- Express App Setup ---
const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
app.use(cors({
    origin: '*', // Allow all origins for now, restrict in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// --- Database Connection Test ---
async function testDbConnection() {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL database!');
        client.release();
    } catch (err) {
        console.error('Error connecting to PostgreSQL database:', err.stack);
    }
}
testDbConnection();

// --- API Routes ---
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the FB System API. The service is up and running.' });
});

app.use('/api', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api', dataRoutes); // Mounts all data routes under /api

// --- Server Start ---
async function startServer() {
    await initializeDatabase(); // Ensure DB is set up
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer().catch(err => console.error('Failed to start server:', err));
