const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
              connectionString: process.env.DATABASE_URL,
              ssl: { rejectUnauthorized: false },
          }
        : {
              host:     process.env.DB_HOST     || 'localhost',
              port:     parseInt(process.env.DB_PORT || '5432'),
              user:     process.env.DB_USER     || 'postgres',
              password: process.env.DB_PASS     || 'password',
              database: process.env.DB_NAME     || 'payflow',
          }
);

(async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Connected to PayFlow PostgreSQL database.');
        client.release();
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
})();

module.exports = pool;