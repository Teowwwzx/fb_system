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
