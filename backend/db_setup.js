// backend/db_setup.js - FINAL AND COMPLETE VERSION

const pool = require('./db');
const bcrypt = require('bcrypt');

// --- TABLE CREATION FUNCTIONS ---
const createRolesTable = (client) => client.query(`CREATE TABLE IF NOT EXISTS roles (role_id SERIAL PRIMARY KEY, role_name VARCHAR(50) UNIQUE NOT NULL)`);
const createUsersTable = (client) => client.query(`CREATE TABLE IF NOT EXISTS users (user_id SERIAL PRIMARY KEY, username VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role_id INTEGER REFERENCES roles(role_id), name VARCHAR(255), status VARCHAR(50) DEFAULT 'active', type VARCHAR(50), last_login_at TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`);
const createActivityLogsTable = (client) => client.query(`CREATE TABLE IF NOT EXISTS activity_logs (id SERIAL PRIMARY KEY, agent VARCHAR(255) NOT NULL, ip_address VARCHAR(45), browser VARCHAR(255), device VARCHAR(255), operation VARCHAR(255), details TEXT, "timestamp" TIMESTAMPTZ DEFAULT NOW())`);
const createGamesTable = (client) => client.query(`CREATE TABLE IF NOT EXISTS games (game_id SERIAL PRIMARY KEY, id VARCHAR(255), name VARCHAR(255) NOT NULL, display_name VARCHAR(255) NOT NULL, balance NUMERIC(15, 2) DEFAULT 0.00, android_url TEXT, ios_url TEXT, robot_status VARCHAR(50) DEFAULT '停用')`);
const createUserGameAccountsTable = (client) => client.query(`CREATE TABLE IF NOT EXISTS user_game_accounts (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(user_id), game_id INTEGER REFERENCES games(game_id), game_account_id VARCHAR(255) NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`);
const createCommissionsTable = (client) => client.query(`CREATE TABLE IF NOT EXISTS commissions (id SERIAL PRIMARY KEY, agent_id VARCHAR(255), turnover NUMERIC(15, 2), commission_rate NUMERIC(5, 4), commission_amount NUMERIC(15, 2), date TIMESTAMPTZ)`);
const createSubAccountsTable = (client) => client.query(`CREATE TABLE IF NOT EXISTS sub_accounts (id SERIAL PRIMARY KEY, username VARCHAR(255) NOT NULL, status VARCHAR(50), login_time TIMESTAMPTZ, ip_address VARCHAR(45))`);

// --- DATA SEEDING FUNCTIONS ---
const seedRoles = async (client) => {
    const roles = ['admin', 'agent', 'sub-agent', 'user'];
    for (const role of roles) {
        const check = await client.query('SELECT * FROM roles WHERE role_name = $1', [role]);
        if (check.rows.length === 0) {
            await client.query('INSERT INTO roles (role_name) VALUES ($1)', [role]);
        }
    }
};

const seedAdminUser = async (client) => {
    const username = 'admin';
    const password = 'password123';
    const userCheck = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) return;

    const passwordHash = await bcrypt.hash(password, 10);
    const roleResult = await client.query('SELECT role_id FROM roles WHERE role_name = $1', ['admin']);
    if (roleResult.rows.length === 0) throw new Error('Role "admin" not found during admin seed.');
    
    await client.query('INSERT INTO users (username, password_hash, role_id, name, status, type) VALUES ($1, $2, $3, $4, $5, $6)', [username, passwordHash, roleResult.rows[0].role_id, 'Administrator', 'active', 'admin']);
};

const seedMockAgents = async (client) => {
    const mockAgents = [
        { username: 'agent1', name: 'John Doe', status: 'active', type: 'daily' },
        { username: 'agent2', name: 'Jane Smith', status: 'inactive', type: 'onetime' },
    ];
    const password = 'password123';
    const roleResult = await client.query('SELECT role_id FROM roles WHERE role_name = $1', ['agent']);
    if (roleResult.rows.length === 0) throw new Error('Role "agent" not found during agent seed.');
    
    const passwordHash = await bcrypt.hash(password, 10);
    for (const agent of mockAgents) {
        const userCheck = await client.query('SELECT * FROM users WHERE username = $1', [agent.username]);
        if (userCheck.rows.length === 0) {
            await client.query('INSERT INTO users (username, password_hash, role_id, name, status, type) VALUES ($1, $2, $3, $4, $5, $6)', [agent.username, passwordHash, roleResult.rows[0].role_id, agent.name, agent.status, agent.type]);
        }
    }
};

const seedTestUsers = async (client) => {
    const testUsers = [
        { username: 'testuser1', name: 'Test User 1', status: 'active', type: 'user' },
        { username: 'testuser2', name: 'Test User 2', status: 'active', type: 'user' },
        { username: 'player1', name: 'Player One', status: 'active', type: 'user' },
    ];
    const password = 'password123';
    const roleResult = await client.query('SELECT role_id FROM roles WHERE role_name = $1', ['user']);
    if (roleResult.rows.length === 0) throw new Error('Role "user" not found during test user seed.');
    
    const passwordHash = await bcrypt.hash(password, 10);
    for (const user of testUsers) {
        const userCheck = await client.query('SELECT * FROM users WHERE username = $1', [user.username]);
        if (userCheck.rows.length === 0) {
            await client.query('INSERT INTO users (username, password_hash, role_id, name, status, type) VALUES ($1, $2, $3, $4, $5, $6)', [user.username, passwordHash, roleResult.rows[0].role_id, user.name, user.status, user.type]);
        }
    }
};

const seedGames = async (client) => {
    const games = [
        { name: '918KISS', display_name: '918KISS', balance: 1000.00 },
        { name: 'MEGA88', display_name: 'MEGA88', balance: 1500.00 },
        { name: 'PUSSY888', display_name: 'PUSSY888', balance: 2000.00 },
        { name: 'JOKER', display_name: 'JOKER', balance: 1200.00 },
        { name: 'ROLLEX', display_name: 'ROLLEX', balance: 800.00 },
        { name: 'Live22', display_name: 'Live22', balance: 1800.00 },
    ];
    
    for (const game of games) {
        const gameCheck = await client.query('SELECT * FROM games WHERE name = $1', [game.name]);
        if (gameCheck.rows.length === 0) {
            await client.query('INSERT INTO games (name, display_name, balance) VALUES ($1, $2, $3)', [game.name, game.display_name, game.balance]);
        }
    }
};


// --- Main Initialization Function ---
const initializeDatabase = async () => {
    console.log('Starting database initialization...');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await createRolesTable(client);
        await createUsersTable(client);
        await createActivityLogsTable(client);
        await createGamesTable(client);
        await createUserGameAccountsTable(client);
        await createCommissionsTable(client);
        await createSubAccountsTable(client);
        console.log("All tables created successfully.");

        await seedRoles(client);
        await seedAdminUser(client);
        await seedMockAgents(client);
        await seedTestUsers(client);
        await seedGames(client);
        console.log("All data seeded successfully.");

        await client.query('COMMIT');
        console.log("Database initialization complete and transaction committed.");
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Database initialization failed. Transaction rolled back.");
        throw err;
    } finally {
        client.release();
        console.log("Database client released.");
    }
};

module.exports = { initializeDatabase };