// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// Login
const loginUser = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const userResult = await pool.query('SELECT u.user_id, u.username, u.password_hash, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.username = $1', [username]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // --- THIS IS THE NEW, CRUCIAL PART ---
        // Create the payload for the token
        const payload = {
            user: {
                id: user.user_id,
                username: user.username,
                role: user.role_name // Include the role in the token
            }
        };

        // Sign the token with a secret key from your .env file
        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Make sure to set this in your backend/.env file!
            { expiresIn: '8h' },   // Token will be valid for 8 hours
            (err, token) => {
                if (err) throw err;
                // Send the token and user info back to the frontend
                res.status(200).json({
                    token,
                    user: payload.user
                });
            }
        );

        // res.status(200).json({
        //     message: 'Login successful',
        //     user: {
        //         user_id: user.user_id,
        //         username: user.username,
        //         role: user.role_name
        //     }
        // });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Register
const registerUser = async (req, res) => {
    const { username, password, role_name = 'viewer' } = req.body; // Default role
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    try {
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }
        const roleResult = await pool.query('SELECT role_id FROM roles WHERE role_name = $1', [role_name]);
        if (roleResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }
        const roleId = roleResult.rows[0].role_id;
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const newUser = await pool.query(
            'INSERT INTO users (username, password_hash, role_id) VALUES ($1, $2, $3) RETURNING user_id, username',
            [username, passwordHash, roleId]
        );
        res.status(201).json({
            message: 'User registered successfully!',
            user: newUser.rows[0]
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    loginUser,
    registerUser,
};
