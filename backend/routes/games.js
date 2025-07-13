const express = require('express');
const router = express.Router();
const { getAllGames } = require('../controllers/gameController');

// @route   GET api/games
// @desc    Get all games
router.get('/', getAllGames);

module.exports = router;