// database.js
const { Pool } = require('pg');
require('dotenv').config();
const schema = require('./schema.js');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function synchronizeDatabase() {
    console.log('[DB] Iniciando sincronização do schema...');
    const client = await pool.connect();
    try {
        for (const tableName in schema) {
            // 1. Verifica se a tabela existe
            const tableExistsResult = await client.query(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)",
                [tableName]
            );

            if (!tableExistsResult.rows[0].exists) {
                // 2. Se não existir, cria a tabela
                let createQuery = `CREATE TABLE ${tableName} (`;
                const columns = [];
                const primaryKeys = [];
                const constraints = [];

                for (const columnName in schema[tableName]) {
                    if (columnName.startsWith('_')) {
                         if(schema[tableName][columnName].type === 'UNIQUE') {
                            constraints.push(`UNIQUE (${schema[tableName][columnName].columns.join(', ')})`);
                        }
                        continue;
                    }

                    const col = schema[tableName][columnName];
                    let columnDef = `${columnName} ${col.type}`;
                    if (col.notNull) columnDef += ' NOT NULL';
                    if (col.default !== undefined) columnDef += ` DEFAULT ${col.default === 'NOW()' ? 'NOW()' : `'${col.default}'`}`;
                    if (col.unique) columnDef += ' UNIQUE';
                    columns.push(columnDef);
                    if(col.primaryKey) primaryKeys.push(columnName);
                }
                
                if(primaryKeys.length > 0) columns.push(`PRIMARY KEY (${primaryKeys.join(', ')})`);
                createQuery += columns.concat(constraints).join(', ');
                createQuery += ');';

                console.log(`[DB] Tabela '${tableName}' não encontrada, a criar...`);
                await client.query(createQuery);
            } else {
                // 3. Se a tabela já existir, verifica se faltam colunas
                for (const columnName in schema[tableName]) {
                    if (columnName.startsWith('_')) continue;

                    const columnExistsResult = await client.query(
                        "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = $1 AND column_name = $2)",
                        [tableName, columnName]
                    );

                    if (!columnExistsResult.rows[0].exists) {
                        const col = schema[tableName][columnName];
                        let columnDef = `${columnName} ${col.type}`;
                        if (col.notNull) columnDef += ' NOT NULL';
                        if (col.default !== undefined) columnDef += ` DEFAULT ${col.default === 'NOW()' ? 'NOW()' : `'${col.default}'`}`;

                        console.log(`[DB] Coluna '${columnName}' não encontrada na tabela '${tableName}', a adicionar...`);
                        await client.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnDef}`);
                    }
                }
            }
        }
        console.log('[DB] Sincronização do schema concluída com sucesso.');
    } catch (err) {
        console.error('[DB] Erro durante a sincronização do schema:', err);
    } finally {
        client.release();
    }
}

module.exports = {
    query: (text, params) => pool.query(text, params),
    synchronizeDatabase,
    // Função adicionada para obter um cliente para transações
    getClient: () => pool.connect(),
};