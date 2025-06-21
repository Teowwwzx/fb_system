// backend/routes/data.js
const express = require('express');
const {
    getActivityLogs,
    getGames,
    getCommissions,
    getSubAccounts,
    getAgentTree,
} = require('../controllers/dataController');
const router = express.Router();

router.get('/activity-logs', getActivityLogs);
router.get('/games', getGames);
router.get('/commissions', getCommissions);
router.get('/sub-accounts', getSubAccounts);
router.get('/agent-tree', getAgentTree);

module.exports = router;
