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
    await seedRoles();
    await seedAdminUser();
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
