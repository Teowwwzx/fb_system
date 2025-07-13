const express = require('express');
const router = express.Router();
const { searchUser, createGameAccounts } = require('../controllers/dashboardController');

// @route   GET api/dashboard/search
// @desc    Search for a user and their game balance
router.get('/search', searchUser);

// @route   POST api/dashboard/create-account
// @desc    Create a new game account for a user
router.post('/create-accounts', createGameAccounts);

module.exports = router;