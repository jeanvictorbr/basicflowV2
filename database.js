// database.js
const { Pool } = require('pg');
require('dotenv').config();
const schema = require('./schema.js');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function initializeDatabase() {
    const client = await pool.connect();
    try {
        console.log('[DB] Conectado ao banco de dados.');
        for (const createTableQuery of schema) {
            await client.query(createTableQuery);
        }
        console.log('[DB] Tabelas verificadas/criadas com sucesso.');
    } catch (err) {
        console.error('[DB] Erro ao inicializar o banco de dados:', err);
    } finally {
        client.release();
    }
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    initializeDatabase
};