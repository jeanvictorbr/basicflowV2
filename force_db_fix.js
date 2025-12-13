// force_db_fix.js
const db = require('./database.js');

(async () => {
    console.log('🛠️  Iniciando Correção da Tabela ticket_departments...');

    try {
        // 1. Diagnóstico: Verifica o tipo atual da coluna
        const check = await db.query(`
            SELECT data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'ticket_departments' AND column_name = 'role_id';
        `);

        if (check.rows.length === 0) {
            console.log('❌ A coluna role_id não existe! Criando a tabela do zero (se necessário)...');
            // Se não existir, o schema.js cuidará disso no próximo reinício
        } else {
            const currentType = check.rows[0].data_type;
            console.log(`ℹ️  Tipo ATUAL da coluna: ${currentType.toUpperCase()}`);

            // 2. Executa a conversão FORÇADA
            console.log('🔄 Convertendo role_id para JSONB...');
            
            // Removemos a restrição NOT NULL temporariamente para evitar erros na conversão
            await db.query(`ALTER TABLE ticket_departments ALTER COLUMN role_id DROP NOT NULL;`);

            // Comando principal de alteração com tratamento de dados
            await db.query(`
                ALTER TABLE ticket_departments 
                ALTER COLUMN role_id TYPE JSONB 
                USING CASE 
                    -- Se a coluna estiver vazia/nula, define como array vazio
                    WHEN role_id IS NULL THEN '[]'::jsonb
                    -- Se já for um array JSON válido, mantém
                    WHEN role_id::text ~ '^\\[.*\\]$' THEN role_id::jsonb
                    -- Se for um ID antigo (string), coloca dentro de um array
                    ELSE jsonb_build_array(role_id)
                END;
            `);

            // Reaplica a restrição NOT NULL (padrão do seu schema) com um valor default seguro
            await db.query(`
                UPDATE ticket_departments SET role_id = '[]'::jsonb WHERE role_id IS NULL;
                ALTER TABLE ticket_departments ALTER COLUMN role_id SET NOT NULL;
            `);
            
            console.log('✅ Conversão concluída com sucesso!');
        }

        // 3. Verificação Final
        const finalCheck = await db.query(`
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'ticket_departments' AND column_name = 'role_id';
        `);
        
        console.log(`🚀 Tipo FINAL da coluna: ${finalCheck.rows[0].data_type.toUpperCase()}`);
        console.log('⚠️  AGORA REINICIE O BOT PARA APLICAR AS ALTERAÇÕES DO CÓDIGO.');

    } catch (error) {
        console.error('❌ Erro Fatal na Migração:', error);
    }

    process.exit();
})();