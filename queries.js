const Pool = require('pg').Pool;
const connectionString = process.env.DATABASE_URL || null;

const localConnection = {
  host: 'localhost',
  database: 'occ',
  password: '',
  port: 5432,
};

const pool = new Pool(connectionString ? { connectionString, ssl: { rejectUnauthorized: false } } : localConnection);

const createPlayer = async (playerObj) => {
  try {
    const { uuid } = playerObj;

    await pool.query(
      'INSERT INTO players (mc_uuid) VALUES ($1) ON CONFLICT (mc_uuid) DO UPDATE SET updated_at = NOW()', 
      [uuid]
    );
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  createPlayer
}
