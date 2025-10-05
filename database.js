const { Pool } = require('pg');
require('dotenv').config();
const schema = require('./schema.js');

// Cria um "pool" de conexões com o banco de dados usando a URL do .env
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Adicione isso se você usa um serviço como Heroku/Render que exige SSL
    // ssl: {
    //   rejectUnauthorized: false
    // }
});

// Função que inicializa o banco de dados
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        // Itera sobre cada tabela definida no nosso schema e a cria se não existir
        for (const createTableQuery of schema) {
            await client.query(createTableQuery);
        }
        console.log('[DB Info] Todas as tabelas foram verificadas/criadas.');
    } catch (err) {
        console.error('[DB Error] Erro ao inicializar o banco de dados:', err);
    } finally {
        client.release();
    }
}

// Exportamos o pool para ser usado em outros arquivos e a função de inicialização
module.exports = {
    query: (text, params) => pool.query(text, params),
    initializeDatabase
};