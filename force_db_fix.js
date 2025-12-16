const db = require('./database.js');

(async () => {
    console.log('🛠️  Iniciando atualização da tabela social_rep_logs...');

    try {
        // Comando SQL direto para criar a coluna se ela não existir
        await db.query(`
            ALTER TABLE social_rep_logs 
            ADD COLUMN IF NOT EXISTS message TEXT;
        `);
        
        console.log('✅ SUCESSO: Coluna "message" adicionada/verificada na tabela social_rep_logs.');
    } catch (error) {
        console.error('❌ ERRO:', error.message);
    } finally {
        console.log('👋 Encerrando script...');
        // O pool do pg pode manter o processo aberto, então forçamos a saída
        setTimeout(() => process.exit(0), 1000);
    }
})();