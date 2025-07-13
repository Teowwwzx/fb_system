const pool = require('../db'); // Your database connection pool

// Get all games from the database
exports.getAllGames = async (req, res) => {
    try {
        const allGames = await pool.query('SELECT * FROM games ORDER BY name ASC');
        res.json(allGames.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};