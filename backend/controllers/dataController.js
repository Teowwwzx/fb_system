// backend/controllers/dataController.js
const pool = require('../db');

// Activity Logs
const getActivityLogs = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM activity_logs ORDER BY timestamp DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching activity logs:', err.message);
        res.status(500).send('Server Error');
    }
};

// Games
const getGames = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM games');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching games:', err.message);
        res.status(500).send('Server Error');
    }
};

// Commissions
const getCommissions = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM commissions ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching commissions:', err.message);
        res.status(500).send('Server Error');
    }
};

// Sub Accounts
const getSubAccounts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sub_accounts');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching sub-accounts:', err.message);
        res.status(500).send('Server Error');
    }
};

// Agent Tree (Static for now)
const getAgentTree = (req, res) => {
    const treeData = [
        {
            title: 'BGM9001 (You)',
            key: '0-0',
            children: [
                { title: 'AGENT007', key: '0-0-0' },
                { title: 'karen', key: '0-0-1' },
            ],
        },
    ];
    res.json(treeData);
};

module.exports = {
    getActivityLogs,
    getGames,
    getCommissions,
    getSubAccounts,
    getAgentTree,
};
