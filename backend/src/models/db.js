const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Em produção, você pode querer configurar tempos limite
  // connectionTimeoutMillis: 2000,
  // idleTimeoutMillis: 30000,
});

module.exports = {
  async query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Em produção, podemos remover ou diminuir o log para não poluir o console
    console.log('executed query', { text, duration, rows: res.rowCount });
    return res;
  },
  pool // <-- ESTA É A LINHA ADICIONADA/CORRIGIDA
};