// Import necessary packages
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const { Pool } = require('pg'); // PostgreSQL client
const { initializeDatabase } = require('./db_setup'); // Import DB setup functions
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5001; // Use port from .env or default to 5001

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')) ? { rejectUnauthorized: false } : false, // Enable SSL for Render
});

// Test DB Connection
async function testDbConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database!');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from DB:', res.rows[0].now);
    client.release();
  } catch (err) {
    console.error('Error connecting to PostgreSQL database:', err.stack);
  }
}
testDbConnection();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Allow the server to accept JSON in request bodies

// Root endpoint to confirm the API is running
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the FB System API. The service is up and running.' });
});

// --- Mock Data (for demonstration) ---
// In a real app, this would come from your database
const mockAgents = [
    { 
        id: 1, 
        username: 'BGM8899', 
        name: 'karen', 
        status: 'Active', 
        type: '每日', // Daily
        lastLogin: '2025-04-20 16:43:14'
    },
    { 
        id: 2, 
        username: 'AGENT007', 
        name: 'James', 
        status: 'Paused', 
        type: '一次', // Onetime
        lastLogin: '2025-05-11 09:15:00'
    }
];

// --- API Endpoints ---

// Endpoint for Activity Logs
app.get('/api/activity-logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activity_logs ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching activity logs:', err.message);
    res.status(500).send('Server Error');
  }
});

// Endpoint for Games
app.get('/api/games', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM games');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching games:', err.message);
    res.status(500).send('Server Error');
  }
});

// Endpoint for Commissions
app.get('/api/commissions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM commissions ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching commissions:', err.message);
    res.status(500).send('Server Error');
  }
});

// Endpoint for Sub Accounts
app.get('/api/sub-accounts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sub_accounts');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching sub-accounts:', err.message);
    res.status(500).send('Server Error');
  }
});

// Endpoint for Agent Tree (Static for now, as hierarchy is not in DB)
app.get('/api/agent-tree', (req, res) => {
    const treeData = [
        {
            title: 'BGM9001 (You)',
            key: '0-0',
            children: [
                {
                    title: 'AGENT007',
                    key: '0-0-0',
                    children: [
                        { title: 'SubAgent_A', key: '0-0-0-0' },
                        { title: 'SubAgent_B', key: '0-0-0-1' },
                    ],
                },
                {
                    title: 'karen',
                    key: '0-0-1',
                    children: [
                        { title: 'SubAgent_C', key: '0-0-1-0' },
                    ],
                },
            ],
        },
    ];
    res.json(treeData);
});

// --- API Endpoints ---
// This is a simple GET endpoint to fetch the list of agents
// Endpoint to create a new agent
app.post('/api/agents', async (req, res) => {
  const { username, name, password, status, type } = req.body;

  if (!username || !name || !password) {
    return res.status(400).json({ message: 'Username, name, and password are required.' });
  }

  try {
    // Check if user already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Get the agent_manager role_id
    const roleResult = await pool.query('SELECT role_id FROM roles WHERE role_name = $1', ['agent_manager']);
    if (roleResult.rows.length === 0) {
      return res.status(500).json({ message: 'Agent Manager role not found.' });
    }
    const agentRoleId = roleResult.rows[0].role_id;

    // Insert the new agent
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
});

app.get('/api/agents', async (req, res) => {
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
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ message: 'Failed to fetch agents' });
  }
});

// NEW: Add a POST endpoint to create a new agent
app.post('/api/agents', (req, res) => {
    console.log('Request received for POST /api/agents');
    const newAgent = req.body;
    
    // Create a new ID and add it to our mock data array
    newAgent.id = Date.now(); // Simple way to generate a unique ID
    newAgent.lastLogin = new Date().toISOString().slice(0, 19).replace('T', ' '); // Set current time
    mockAgents.push(newAgent);
    
    console.log('New agent created:', newAgent);
    res.status(201).json(newAgent); // Respond with the newly created agent
});

// Endpoint for creating a Sub Account
app.post('/api/sub-accounts', (req, res) => {
    const newAccount = req.body;
    newAccount.id = `sa${Date.now()}`;
    newAccount.status = 'Active'; // Default status
    newAccount.lastLogin = new Date().toISOString().slice(0, 19).replace('T', ' ');
    mockSubAccounts.push(newAccount);
    console.log('New Sub Account Created:', newAccount);
    res.status(201).json(newAccount);
});

app.get('/api/agents/tree', (req, res) => res.json(agentTreeData));

app.get('/api/activity-log', (req, res) => {
    console.log('Request received for GET /api/activity-log with query:', req.query);
    let filteredLogs = [...mockActivityLogs];
    
    // Filter by username (agent)
    if (req.query.username) {
        filteredLogs = filteredLogs.filter(log => 
            log.agent.toLowerCase().includes(req.query.username.toLowerCase())
        );
    }

    // Filter by IP Address
    if (req.query.ip) {
        filteredLogs = filteredLogs.filter(log => 
            log.ip.includes(req.query.ip)
        );
    }
    
    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);
        
        filteredLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= startDate && logDate <= endDate;
        });
    }

    setTimeout(() => {
        res.json(filteredLogs);
    }, 500); // Simulate network delay
});

// NEW: GET endpoint for games list
app.get('/api/games', (req, res) => {
    console.log('Request received for GET /api/games');
    setTimeout(() => {
        res.json(mockGames);
    }, 300); // Simulate network delay
});

// NEW: GET endpoint for commissions with filtering
app.get('/api/commissions', (req, res) => {
    console.log('Request received for GET /api/commissions with query:', req.query);
    let filteredCommissions = [...mockCommissions];

    // Filter by agent username
    if (req.query.agentUsername) {
        filteredCommissions = filteredCommissions.filter(c => 
            c.agentUsername.toLowerCase().includes(req.query.agentUsername.toLowerCase())
        );
    }
    
    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(req.query.endDate);
        
        filteredCommissions = filteredCommissions.filter(c => {
            const commissionDate = new Date(c.date);
            // Adjust to include the full start and end days
            return commissionDate >= startDate.setHours(0,0,0,0) && commissionDate <= endDate.setHours(23,59,59,999);
        });
    }

    setTimeout(() => {
        res.json(filteredCommissions);
    }, 400); // Simulate network delay
});

// Endpoint for Changing Password
app.post('/api/user/change-password', (req, res) => {
    const { currentPassword, newPassword } = req.body;
    console.log('Change Password Request:', req.body);
    // In a real app, you'd validate the hash of the current password
    if (currentPassword === '123456') { // Mocking a correct password
        // In a real app, you'd hash and save the newPassword
        res.json({ success: true, message: 'Password updated successfully!' });
    } else {
        res.status(400).json({ success: false, message: 'Your current password is not correct.' });
    }
});

// Endpoint for Feedback
app.post('/api/feedback', (req, res) => {
    console.log('New Feedback Received:', req.body);
    res.json({ success: true, message: 'Thank you for your feedback!' });
});

// Endpoint for generating a Sales Report
// We use POST here because the filter criteria can be very large (many games selected)
app.post('/api/reports/sales', (req, res) => {
    console.log('Sales Report generation requested with filters:', req.body);
    // In a real app, you would query the database based on the filters.
    // For our mock, we just return the same sample data regardless of the filter.
    res.json(mockSalesReport);
});

// API Endpoint for User Registration
app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body; // role should be the role_name like 'admin'

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password, and role are required.' });
    }

    try {
        // 1. Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 2. Get the role_id from the role_name
        const roleResult = await pool.query('SELECT role_id FROM roles WHERE role_name = $1', [role]);
        if (roleResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid role specified.' });
        }
        const roleId = roleResult.rows[0].role_id;

        // 3. Insert the new user into the database
        const newUser = await pool.query(
            'INSERT INTO users (username, password_hash, role_id) VALUES ($1, $2, $3) RETURNING user_id, username, created_at',
            [username, passwordHash, roleId]
        );

        console.log('New user registered:', newUser.rows[0]);
        res.status(201).json({ 
            message: 'User registered successfully!', 
            user: newUser.rows[0] 
        });

    } catch (err) {
        if (err.code === '23505') { // Unique violation error code for PostgreSQL
            return res.status(409).json({ message: 'Username already exists.' });
        }
        console.error('Error during registration:', err.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// --- Login Endpoint ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Fetch user from the database
    const userResult = await pool.query('SELECT u.user_id, u.username, u.password_hash, r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id WHERE u.username = $1', [username]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = userResult.rows[0];

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Login successful
    // For now, just send back user info (excluding password hash)
    // In a real app, you'd generate a JWT here
    res.status(200).json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role_name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// --- Start the Server ---
async function startServer() {
  await initializeDatabase(); // Ensure DB is set up

  app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => console.error('Failed to start server:', err));