// Substitua o conteúdo em: database.js
const { Pool } = require('pg');
require('dotenv').config();
const schema = require('./schema.js');
const MODULES = require('./config/modules.js');

// Pool com configurações mais robustas
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Número máximo de clientes no pool
    idleTimeoutMillis: 30000, // Fecha clientes inativos após 30 segundos
    connectionTimeoutMillis: 5000, // Retorna um erro se não conseguir conectar em 5 segundos
});

// Adiciona um listener para erros inesperados no pool
pool.on('error', (err, client) => {
  console.error('Erro inesperado em um cliente inativo do banco de dados', err);
});

async function synchronizeDatabase() {
    console.log('[DB] Iniciando sincronização do schema...');
    const client = await pool.connect();
    try {
        for (const tableName in schema) {
            const tableExistsResult = await client.query(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)",
                [tableName]
            );

            if (!tableExistsResult.rows[0].exists) {
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

        console.log('[DB] Sincronizando tabela de status dos módulos...');
        const moduleNames = MODULES.map(m => m.name);
        for (const moduleName of moduleNames) {
            await client.query(
                'INSERT INTO module_status (module_name) VALUES ($1) ON CONFLICT (module_name) DO NOTHING',
                [moduleName]
            );
        }
        console.log('[DB] Sincronização dos módulos concluída.');
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
    getClient: () => pool.connect(),
};