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
    await addColumnIfNotExists('users', 'name', 'VARCHAR(255)');
    await addColumnIfNotExists('users', 'status', 'VARCHAR(50) DEFAULT \'active\'');
    await addColumnIfNotExists('users', 'type', 'VARCHAR(50)');
    await addColumnIfNotExists('users', 'last_login_at', 'TIMESTAMP WITH TIME ZONE');
  } catch (err) {
    console.error('Error creating or altering "users" table:', err.stack);
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
      id SERIAL PRIMARY KEY,
      agent_id VARCHAR(255),
      turnover NUMERIC(15, 2),
      commission_rate NUMERIC(5, 4),
      commission_amount NUMERIC(15, 2),
      date TIMESTAMPTZ
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
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      status VARCHAR(50),
      login_time TIMESTAMPTZ,
      ip_address VARCHAR(45)
    );
  `;
  try {
    await pool.query(query);
    console.log('Table "sub_accounts" created or already exists.');
  } catch (err) {
    console.error('Error creating "sub_accounts" table:', err.stack);
  }
};

const seedRoles = async () => {
  const roles = ['admin', 'agent_manager', 'viewer'];
  try {
    for (const role of roles) {
      const check = await pool.query('SELECT * FROM roles WHERE role_name = $1', [role]);
      if (check.rows.length === 0) {
        await pool.query('INSERT INTO roles (role_name) VALUES ($1)', [role]);
        console.log(`Role "${role}" seeded.`);
      }
    }
    console.log('Roles seeding process completed.');
  } catch (err) {
    console.error('Error seeding roles:', err.stack);
  }
};

const seedAdminUser = async () => {
  const username = 'admin';
  const password = 'password';
  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      console.log(`User "${username}" already exists.`);
      return;
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const roleResult = await pool.query('SELECT role_id FROM roles WHERE role_name = $1', ['admin']);
    if (roleResult.rows.length === 0) {
      console.error('Admin role not found. Cannot seed admin user.');
      return;
    }
    const adminRoleId = roleResult.rows[0].role_id;
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
  const password = 'password123';
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

const seedActivityLogs = async () => {
    const check = await pool.query('SELECT COUNT(*) FROM activity_logs');
    if (check.rows[0].count > 0) return;
    const logs = [
        { agent: 'agent1', ip: '192.168.1.1', browser: 'Chrome', device: 'Desktop', op: 'Login', details: 'User logged in' },
        { agent: 'agent2', ip: '10.0.0.5', browser: 'Safari', device: 'Mobile', op: 'Create Agent', details: 'Created agent: agent3' }
    ];
    for (const log of logs) {
        await pool.query('INSERT INTO activity_logs (agent, ip_address, browser, device, operation, details) VALUES ($1, $2, $3, $4, $5, $6)', [log.agent, log.ip, log.browser, log.device, log.op, log.details]);
    }
    console.log('Mock activity logs seeded.');
};

const seedGames = async () => {
    const check = await pool.query('SELECT COUNT(*) FROM games');
    if (check.rows[0].count > 0) return;
    const games = [
        { id: '9K', name: '9K彩票', balance: 10000.00, android: '#', ios: '#', status: '启用' },
        { id: 'BBIN', name: 'BBIN彩票', balance: 5000.00, android: '#', ios: '#', status: '停用' }
    ];
    for (const game of games) {
        await pool.query('INSERT INTO games (id, display_name, balance, android_url, ios_url, robot_status) VALUES ($1, $2, $3, $4, $5, $6)', [game.id, game.name, game.balance, game.android, game.ios, game.status]);
    }
    console.log('Mock games seeded.');
};

const seedCommissions = async () => {
    const check = await pool.query('SELECT COUNT(*) FROM commissions');
    if (check.rows[0].count > 0) return;
    const commissions = [
        { agent: 'agent1', turnover: 50000, rate: 0.01, amount: 500, date: '2023-10-26T10:00:00Z' },
        { agent: 'agent2', turnover: 120000, rate: 0.015, amount: 1800, date: '2023-10-25T10:00:00Z' }
    ];
    for (const comm of commissions) {
        await pool.query('INSERT INTO commissions (agent_id, turnover, commission_rate, commission_amount, date) VALUES ($1, $2, $3, $4, $5)', [comm.agent, comm.turnover, comm.rate, comm.amount, comm.date]);
    }
    console.log('Mock commissions seeded.');
};

const seedSubAccounts = async () => {
    const check = await pool.query('SELECT COUNT(*) FROM sub_accounts');
    if (check.rows[0].count > 0) return;
    const accounts = [
        { user: 'sub1', status: '启用', time: '2023-10-26T12:00:00Z', ip: '192.168.1.10' },
        { user: 'sub2', status: '停用', time: null, ip: null }
    ];
    for (const acc of accounts) {
        await pool.query('INSERT INTO sub_accounts (username, status, login_time, ip_address) VALUES ($1, $2, $3, $4)', [acc.user, acc.status, acc.time, acc.ip]);
    }
    console.log('Mock sub accounts seeded.');
};

const initializeDatabase = async () => {
  console.log('Starting database initialization...');
  await createRolesTable();
  await createUsersTable();
  await createActivityLogsTable();
  await createGamesTable();
  await createCommissionsTable();
  await createSubAccountsTable();
  
  await seedRoles();
  await seedAdminUser();
  await seedMockAgents();
  await seedActivityLogs();
  await seedGames();
  await seedCommissions();
  await seedSubAccounts();
  
  console.log('Database initialization complete.');
};

module.exports = { initializeDatabase };
