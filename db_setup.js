require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com')) ? { rejectUnauthorized: false } : false, // Enable SSL for Render
});

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
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords only!
      email VARCHAR(255) UNIQUE,
      role_id INTEGER REFERENCES roles(role_id),
      status VARCHAR(20) DEFAULT 'active', -- e.g., active, inactive, suspended
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMPTZ
    );
  `;
  try {
    await pool.query(queryText);
    console.log('Table "users" created or already exists.');
  } catch (err) {
    console.error('Error creating "users" table:', err.stack);
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
