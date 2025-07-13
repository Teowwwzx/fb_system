// backend/routes/index.js

const express = require('express');
const router = express.Router();

// Import all your specific route files
const authRoutes = require('./auth');
const agentRoutes = require('./agents');
const dataRoutes = require('./data');
const dashboardRoutes = require('./dashboard');
// Add any other route files you create here

// Use the specific routers. This tells the master router how to delegate requests.
// Any request to /login or /register will be handled by authRoutes.
router.use(authRoutes);

// Any request starting with /agents will be handled by agentRoutes.
router.use('/agents', agentRoutes);

// Any request to /data will be handled by dataRoutes.
router.use('/data', dataRoutes);

// Any request to /dashboard will be handled by dashboardRoutes.
router.use('/dashboard', dashboardRoutes);

module.exports = router;