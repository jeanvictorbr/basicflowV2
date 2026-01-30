// Arquivo: fix_db.js
const db = require('./database.js');

async function fix() {
    try {
        console.log('⏳ Corrigindo banco de dados...');
        
        // Adiciona a coluna na tabela correta (guild_settings)
        await db.query(`
            ALTER TABLE guild_settings 
            ADD COLUMN IF NOT EXISTS suggestions_vitrine_image TEXT;
        `);
        
        console.log('✅ Sucesso! Coluna criada em guild_settings.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Erro:', e);
        process.exit(1);
    }
}

fix();