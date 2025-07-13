const pool = require('../db');

// Get all users with the 'user' role (i.e., players)
exports.getAllPlayers = async (req, res) => {
    try {
        const players = await pool.query(
            "SELECT u.user_id, u.username, u.name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE r.role_name = 'user' ORDER BY u.username"
        );
        res.json(players.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};