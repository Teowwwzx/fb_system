// backend/controllers/agentController.js
const bcrypt = require('bcrypt');
const pool = require('../db');

// Get all agents
const getAllAgents = async (req, res) => {
    try {
        const query = `
            SELECT 
                user_id,
                username,
                name,
                status,
                type,
                last_login_at AS "lastLogin" 
            FROM users
            WHERE role_id = (SELECT role_id FROM roles WHERE role_name = 'agent_manager')
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ message: 'Failed to fetch agents' });
    }
};

// Create a new agent
const createAgent = async (req, res) => {
    const { username, name, password, status, type } = req.body;
    if (!username || !name || !password) {
        return res.status(400).json({ message: 'Username, name, and password are required.' });
    }
    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ message: 'Username already exists.' });
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const roleResult = await pool.query('SELECT role_id FROM roles WHERE role_name = $1', ['agent_manager']);
        if (roleResult.rows.length === 0) {
            return res.status(500).json({ message: 'Agent Manager role not found.' });
        }
        const agentRoleId = roleResult.rows[0].role_id;
        const insertQuery = `
            INSERT INTO users (username, password_hash, role_id, name, status, type)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id, username, name, status, type, last_login_at;
        `;
        const newUser = await pool.query(insertQuery, [username, passwordHash, agentRoleId, name, status, type]);
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        console.error('Error creating agent:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAllAgents,
    createAgent,
};
