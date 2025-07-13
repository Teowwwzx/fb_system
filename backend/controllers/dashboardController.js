const pool = require('../db'); // Your database connection pool

// Search for a user and their game accounts
exports.searchUser = async (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    try {
        // Find the user first
        const userResult = await pool.query('SELECT user_id, name FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = userResult.rows[0];

        // Find their game accounts
        const accountsResult = await pool.query(
            `SELECT g.name as game_name, uga.game_account_id, g.balance 
             FROM user_game_accounts uga 
             JOIN games g ON uga.game_id = g.game_id 
             WHERE uga.user_id = $1`,
            [user.user_id]
        );

        res.json({
            username: username,
            name: user.name,
            accounts: accountsResult.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create a new game account for a user
exports.createGameAccount = async (req, res) => {
    const { username, game_id, phone_number, amount } = req.body;
    
    try {
        const userResult = await pool.query('SELECT user_id FROM users WHERE username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User to assign account to not found' });
        }
        const userId = userResult.rows[0].user_id;

        // Generate a unique Game ID (simple example)
        const gameResult = await pool.query('SELECT name FROM games WHERE game_id = $1', [game_id]);
        const gamePrefix = gameResult.rows[0].name.substring(0, 3).toUpperCase();
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const newGameAccountId = `${gamePrefix}-${randomNum}`;

        const newAccount = await pool.query(
            'INSERT INTO user_game_accounts (user_id, game_id, game_account_id) VALUES ($1, $2, $3) RETURNING *',
            [userId, game_id, newGameAccountId]
        );

        // You might also create a transaction record here for the 'amount'
        // ...

        res.status(201).json(newAccount.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};