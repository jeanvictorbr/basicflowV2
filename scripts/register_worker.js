const db = require('../database.js');
const { encrypt } = require('../utils/encryption.js');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.log('--- REGISTRO DE BOT DE MÚSICA (WORKER) ---');

rl.question('Digite o CLIENT ID do bot de música: ', (clientId) => {
    rl.question('Digite o TOKEN do bot de música: ', async (token) => {
        rl.question('Digite um Nome (ex: Music 01): ', async (name) => {
            
            const enc = encrypt(token);
            if (!enc) {
                console.log('❌ Erro ao encriptar token. Verifique seu .env');
                process.exit(1);
            }

            try {
                await db.query(`
                    INSERT INTO music_workers (client_id, token_enc, iv, name, is_active)
                    VALUES ($1, $2, $3, $4, true)
                    ON CONFLICT (client_id) DO UPDATE SET token_enc = $2, iv = $3, name = $4
                `, [clientId, enc.content, enc.iv, name]);
                
                console.log(`✅ Bot ${name} registrado com sucesso!`);
            } catch (error) {
                console.error('❌ Erro no banco de dados:', error);
            } finally {
                process.exit(0);
            }
        });
    });
});