// backend/routes/agents.js
const express = require('express');
const { getAllAgents, createAgent } = require('../controllers/agentController');
const router = express.Router();

router.get('/', getAllAgents);
router.post('/', createAgent);

module.exports = router;
