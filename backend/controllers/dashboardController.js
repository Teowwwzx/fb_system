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
exports.createGameAccounts = async (req, res) => {
    const { user_id, game_ids } = req.body;

    if (!user_id || !game_ids || !Array.isArray(game_ids) || game_ids.length === 0) {
        return res.status(400).json({ error: 'User ID and a list of game IDs are required.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Start a transaction

        const createdAccounts = [];
        for (const game_id of game_ids) {
            // Generate a unique Game ID
            const gameResult = await client.query('SELECT name FROM games WHERE game_id = $1', [game_id]);
            if (gameResult.rows.length === 0) continue; // Skip if game doesn't exist

            const gamePrefix = gameResult.rows[0].name.substring(0, 3).toUpperCase();
            const randomNum = Math.floor(10000 + Math.random() * 90000);
            const newGameAccountId = `${gamePrefix}-${randomNum}`;

            const newAccount = await client.query(
                'INSERT INTO user_game_accounts (user_id, game_id, game_account_id) VALUES ($1, $2, $3) RETURNING game_account_id',
                [user_id, game_id, newGameAccountId]
            );
            createdAccounts.push({ 
                game_name: gameResult.rows[0].name, 
                game_account_id: newAccount.rows[0].game_account_id 
            });
        }

        await client.query('COMMIT'); // Commit the transaction
        res.status(201).json({
            message: 'Game accounts created successfully!',
            accounts: createdAccounts
        });

    } catch (err) {
        await client.query('ROLLBACK'); // Roll back on error
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
};