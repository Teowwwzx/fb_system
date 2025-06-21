require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')) ? { rejectUnauthorized: false } : false, // Enable SSL for Render
});

const addColumnIfNotExists = async (tableName, columnName, columnDefinition) => {
  const checkColumnQuery = `
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = $1 AND column_name = $2
  `;
  const { rows } = await pool.query(checkColumnQuery, [tableName, columnName]);
  if (rows.length === 0) {
    const alterTableQuery = `ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${columnDefinition}`;
    await pool.query(alterTableQuery);
    console.log(`Column "${columnName}" added to table "${tableName}".`);
  }
};

const createRolesTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS roles (
      role_id SERIAL PRIMARY KEY,
      role_name VARCHAR(50) UNIQUE NOT NULL
    );
  `;
  try {
    await pool.query(queryText);
    console.log('Table "roles" created or already exists.');
  } catch (err) {
    console.error('Error creating "roles" table:', err.stack);
  }
};

const createUsersTable = async () => {
  const createUsersTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role_id INTEGER REFERENCES roles(role_id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createUsersTableQuery);
    console.log('Table "users" created or already exists.');

    // Add new columns if they don't exist, making the script safe for existing tables
    await addColumnIfNotExists('users', 'name', 'VARCHAR(255)');
    await addColumnIfNotExists('users', 'status', 'VARCHAR(50) DEFAULT \'active\'');
    await addColumnIfNotExists('users', 'type', 'VARCHAR(50)');
    await addColumnIfNotExists('users', 'last_login_at', 'TIMESTAMP WITH TIME ZONE');

  } catch (err) {
    console.error('Error creating or altering "users" table:', err.stack);
  }
};

const seedAdminUser = async () => {
  const username = 'admin';
  const password = 'password'; // Use a more secure password in a real production environment

  try {
    // Check if the admin user already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      console.log(`User "${username}" already exists.`);
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Get the admin role_id
    const roleResult = await pool.query('SELECT role_id FROM roles WHERE role_name = $1', ['admin']);
    if (roleResult.rows.length === 0) {
      console.error('Admin role not found. Cannot seed admin user.');
      return;
    }
    const adminRoleId = roleResult.rows[0].role_id;

    // Insert the admin user
    const insertQuery = `
      INSERT INTO users (username, password_hash, role_id, name, status, type)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await pool.query(insertQuery, [username, passwordHash, adminRoleId, 'Administrator', 'active', 'admin']);
    console.log(`Admin user "${username}" created successfully.`);

  } catch (err) {
    console.error('Error seeding admin user:', err.stack);
  }
};

const seedMockAgents = async () => {
  const mockAgents = [
    { username: 'agent1', name: 'John Doe', status: 'active', type: 'daily' },
    { username: 'agent2', name: 'Jane Smith', status: 'inactive', type: 'onetime' },
    { username: 'agent3', name: 'Peter Jones', status: 'active', type: 'daily' },
  ];
  const password = 'password123'; // Default password for all mock agents

  try {
    const roleResult = await pool.query('SELECT role_id FROM roles WHERE role_name = $1', ['agent_manager']);
    if (roleResult.rows.length === 0) {
      console.error('Agent Manager role not found. Cannot seed mock agents.');
      return;
    }
    const agentRoleId = roleResult.rows[0].role_id;
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    for (const agent of mockAgents) {
      const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [agent.username]);
      if (userCheck.rows.length === 0) {
        const insertQuery = `
          INSERT INTO users (username, password_hash, role_id, name, status, type)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await pool.query(insertQuery, [agent.username, passwordHash, agentRoleId, agent.name, agent.status, agent.type]);
        console.log(`Mock agent "${agent.username}" created.`);
      }
    }
    console.log('Mock agent seeding process completed.');
  } catch (err) {
    console.error('Error seeding mock agents:', err.stack);
  }
};

const createActivityLogsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      agent VARCHAR(255) NOT NULL,
      ip_address VARCHAR(45),
      browser VARCHAR(255),
      device VARCHAR(255),
      operation VARCHAR(255),
      details TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    );
  `;
  try {
    await pool.query(query);
    console.log('Table "activity_logs" created or already exists.');
  } catch (err) {
    console.error('Error creating "activity_logs" table:', err.stack);
  }
};

const createGamesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS games (
      id VARCHAR(255) PRIMARY KEY,
      display_name VARCHAR(255) NOT NULL,
      balance NUMERIC(15, 2) DEFAULT 0.00,
      android_url TEXT,
      ios_url TEXT,
      robot_status VARCHAR(50) DEFAULT '停用'
    );
  `;
  try {
    await pool.query(query);
    console.log('Table "games" created or already exists.');
  } catch (err) {
    console.error('Error creating "games" table:', err.stack);
  }
};

const createCommissionsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS commissions (
      id VARCHAR(255) PRIMARY KEY,
      agent_username VARCHAR(255) NOT NULL,
      game VARCHAR(255) NOT NULL,
      turnover NUMERIC(15, 2) DEFAULT 0.00,
      commission_rate NUMERIC(5, 4) DEFAULT 0.0000,
      commission_amount NUMERIC(15, 2) DEFAULT 0.00,
      date DATE NOT NULL
    );
  `;
  try {
    await pool.query(query);
    console.log('Table "commissions" created or already exists.');
  } catch (err) {
    console.error('Error creating "commissions" table:', err.stack);
  }
};

const createSubAccountsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS sub_accounts (
      id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      last_login TIMESTAMPTZ,
      remarks TEXT,
      status VARCHAR(50) DEFAULT 'Paused'
    );
  `;
  try {
    await pool.query(query);
    console.log('Table "sub_accounts" created or already exists.');
  } catch (err) {
    console.error('Error creating "sub_accounts" table:', err.stack);
  }
};

const seedInitialData = async () => {
  try {
    // Seed Activity Logs
    const activityLogs = [
      { agent: 'BGM8899', ip: '192.168.1.101', browser: 'Chrome', device: 'Desktop', operation: 'Login', details: 'User logged in successfully' },
      { agent: 'AGENT007', ip: '203.0.113.45', browser: 'Safari', device: 'Mobile', operation: 'Create Agent', details: 'Created agent [NEW001]' },
    ];
    for (const log of activityLogs) {
      await pool.query('INSERT INTO activity_logs (agent, ip_address, browser, device, operation, details) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING', 
        [log.agent, log.ip, log.browser, log.device, log.operation, log.details]);
    }
    console.log('Activity logs seeded.');

    // Seed Games
    const games = [
      { id: 'g1', displayName: 'KISS918', balance: 472253.45, androidUrl: 'https://yop.1918kiss.com', iosUrl: null, robotStatus: '启用' },
      { id: 'g2', displayName: '918KISS', balance: 167155.34, androidUrl: 'https://m.918kiss.com/android', iosUrl: 'https://m.918kiss.com/ios', robotStatus: '停用' },
    ];
    for (const game of games) {
      await pool.query('INSERT INTO games (id, display_name, balance, android_url, ios_url, robot_status) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING', 
        [game.id, game.displayName, game.balance, game.androidUrl, game.iosUrl, game.robotStatus]);
    }
    console.log('Games seeded.');

    // Seed Commissions
    const commissions = [
      { id: 'c1', agentUsername: 'BGM8899', game: 'KISS918', turnover: 55000.00, commissionRate: 0.005, commissionAmount: 275.00, date: '2025-06-08' },
      { id: 'c2', agentUsername: 'AGENT007', game: 'MEGA888', turnover: 120000.00, commissionRate: 0.004, commissionAmount: 480.00, date: '2025-06-08' },
    ];
    for (const comm of commissions) {
      await pool.query('INSERT INTO commissions (id, agent_username, game, turnover, commission_rate, commission_amount, date) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING', 
        [comm.id, comm.agentUsername, comm.game, comm.turnover, comm.commissionRate, comm.commissionAmount, comm.date]);
    }
    console.log('Commissions seeded.');

    // Seed Sub Accounts
    const subAccounts = [
      { id: 'sa1', username: 'support01', lastLogin: '2025-06-08 11:30:00', remarks: 'Support team member', status: 'Active' },
      { id: 'sa2', username: 'finance_ops', lastLogin: '2025-06-07 17:00:15', remarks: 'Finance department', status: 'Active' },
    ];
    for (const acc of subAccounts) {
      await pool.query('INSERT INTO sub_accounts (id, username, last_login, remarks, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING', 
        [acc.id, acc.username, acc.lastLogin, acc.remarks, acc.status]);
    }
    console.log('Sub-accounts seeded.');

  } catch (err) {
    console.error('Error seeding initial data:', err.stack);
  }
};

const seedRoles = async () => {
  const rolesToSeed = ['admin', 'agent_manager', 'sub_account_user', 'viewer'];
  let seededCount = 0;
  try {
    for (const roleName of rolesToSeed) {
      const checkRole = await pool.query('SELECT * FROM roles WHERE role_name = $1', [roleName]);
      if (checkRole.rows.length === 0) {
        await pool.query('INSERT INTO roles (role_name) VALUES ($1)', [roleName]);
        console.log(`Role "${roleName}" seeded.`);
        seededCount++;
      }
    }
    if (seededCount > 0) {
      console.log(`${seededCount} role(s) seeded successfully.`);
    } else {
      console.log('Roles already seeded.');
    }
  } catch (err) {
    console.error('Error seeding roles:', err.stack);
  }
};

const initializeDatabase = async () => {
  try {
    await createRolesTable();
    await createUsersTable();
    await createActivityLogsTable();
    await createGamesTable();
    await createCommissionsTable();
    await createSubAccountsTable();

    await seedRoles();
    await seedAdminUser();
    await seedMockAgents();
    await seedInitialData();
    console.log('Database initialization process completed.');
  } catch (err) {
    console.error('Error during database initialization:', err.stack);
  } finally {
    // Optionally, close the pool if this script is run standalone and not imported
    // await pool.end(); 
    // console.log('Database connection pool closed.');
  }
};

// If this script is run directly, initialize the database
if (require.main === module) {
  initializeDatabase().then(() => {
    console.log('Standalone DB setup script finished.');
    pool.end(); // Close pool when run directly
  }).catch(err => {
    console.error('Standalone DB setup script failed:', err);
    pool.end(); // Ensure pool is closed on failure too
  });
} else {
  // Export for use in server.js
  module.exports = { initializeDatabase, pool };
}
