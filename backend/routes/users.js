const express = require('express');
const router = express.Router();
const { getAllPlayers } = require('../controllers/userController');

// @route   GET api/users/players
// @desc    Get all player accounts
router.get('/players', getAllPlayers);

module.exports = router;