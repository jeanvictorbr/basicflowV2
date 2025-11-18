// handlers/modals/modal_membros_transfer_manual_id.js
// CONTEÚDO COMPLETO E ATUALIZADO (FORÇA ENTRADA + PEGA TOKEN MAIS RECENTE)

const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
// Importa o utilitário que você criou
const { addMemberToGuild } = require('../../utils/guildMemberManager.js'); 

module.exports = {
    customId: 'modal_membros_transfer_manual_id',
    async execute(interaction) {

        if (!process.env.DEVELOPER_IDS.includes(interaction.user.id)) {
            return interaction.reply({ content: 'Acesso negado.', flags: EPHEMERAL_FLAG });
        }
        
        const targetGuildId = interaction.fields.getTextInputValue('target_guild_id');
        const quantityStr = interaction.fields.getTextInputValue('quantity');
        const adminUserId = interaction.user.id;

        await interaction.deferReply({
            content: `🚀 Iniciando transferência GLOBAL em massa para a Guilda \`${targetGuildId}\`. Isso pode levar vários minutos...\n*Isso tentará forçar a entrada dos usuários no servidor.*`,
            flags: EPHEMERAL_FLAG
        });

        let targetGuild;
        try {
            targetGuild = await interaction.client.guilds.fetch(targetGuildId);
            if (!targetGuild) throw new Error('Guilda não encontrada pelo fetch.');
        } catch (e) {
             return interaction.followUp({
                content: `❌ Falha ao encontrar a Guilda de destino \`${targetGuildId}\`. O bot está nela?`,
                flags: EPHEMERAL_FLAG
            });
        }
        
        let limitClause = '';
        const quantity = parseInt(quantityStr, 10);

        if (quantityStr.toUpperCase() === 'ALL') {
            limitClause = ''; // Sem limite
        } else if (!isNaN(quantity) && quantity > 0) {
            limitClause = `LIMIT ${quantity}`;
        } else {
            return interaction.editReply({
                content: '❌ Quantidade inválida. Use "ALL" ou um número maior que 0.',
                flags: EPHEMERAL_FLAG
            });
        }

        try {
            // ===================================================================
            //  ⬇️  LÓGICA CORRIGIDA (PEGA O TOKEN MAIS RECENTE) ⬇️
            // ===================================================================

            // 1. Encontrar usuários que NÃO ESTÃO na guilda de destino
            // E obter seus tokens de acesso MAIS RECENTES (que não sejam nulos)
            const usersQuery = `
                WITH params AS (
                    SELECT $1::VARCHAR(255) as guild_id_param
                ),
                -- Etapa 1: Encontrar IDs de usuários que NÃO ESTÃO na guilda de destino
                users_to_add AS (
                    SELECT a.user_id
                    FROM (SELECT DISTINCT user_id FROM cloudflow_verified_users) a
                    LEFT JOIN cloudflow_verified_users b ON a.user_id = b.user_id AND b.guild_id = (SELECT guild_id_param FROM params)
                    WHERE b.guild_id IS NULL
                ),
                -- Etapa 2: Obter os dados COMPLETOS (da verificação MAIS RECENTE)
                data_to_copy AS (
                    SELECT DISTINCT ON (u.user_id) 
                        u.user_id, 
                        u.access_token_encrypted,
                        u.refresh_token_encrypted,
                        u.expires_at,
                        u.verified_at
                    FROM cloudflow_verified_users u
                    JOIN users_to_add a ON u.user_id = a.user_id
                    WHERE u.access_token_encrypted IS NOT NULL -- Ignora registros antigos sem token
                    ORDER BY u.user_id, u.verified_at DESC -- <-- CORRIGIDO PARA 'DESC'
                )
                SELECT * FROM data_to_copy
                ${limitClause};
            `;
            
            const { rows: usersToTransfer } = await db.query(usersQuery, [targetGuildId]);

            if (usersToTransfer.length === 0) {
                return interaction.editReply({
                    content: '✅ 0 novos membros para transferir. (Ou todos já estão na guilda, ou os usuários verificados não possuem tokens de acesso válidos).',
                    flags: EPHEMERAL_FLAG
                });
            }

            // 2. Tentar adicionar cada usuário
            let successCount = 0;
            let failCount = 0;
            const logEntries = [];

            for (const user of usersToTransfer) {
                try {
                    // Tenta forçar a entrada na guilda
                    await addMemberToGuild(targetGuild, user.user_id, user.access_token_encrypted);
                    
                    // Se teve sucesso, copia o registro no DB
                    await db.query(`
                        INSERT INTO cloudflow_verified_users 
                            (guild_id, user_id, access_token_encrypted, refresh_token_encrypted, expires_at, verified_at)
                        VALUES
                            ($1, $2, $3, $4, $5, $6)
                        ON CONFLICT (guild_id, user_id) DO NOTHING;
                    `, [targetGuildId, user.user_id, user.access_token_encrypted, user.refresh_token_encrypted, user.expires_at, user.verified_at]);
                    
                    successCount++;
                    logEntries.push([user.user_id, targetGuildId, 'success_mass_global']);

                } catch (e) {
                    console.warn(`[Transferência Global] Falha ao adicionar ${user.user_id}: ${e.message}`);
                    failCount++;
                    logEntries.push([user.user_id, targetGuildId, `failed: ${e.message.substring(0, 30)}`]);
                }
            }

            // 3. Registrar Logs no DB (Corrigido para loop)
            if (logEntries.length > 0) {
                 const logQuery = `
                    INSERT INTO cloudflow_transfer_logs (user_id, target_guild_id, status)
                    VALUES ($1, $2, $3::VARCHAR(50))
                    ON CONFLICT (user_id, target_guild_id) DO UPDATE SET status = $3::VARCHAR(50);
                `;
                for (const entry of logEntries) {
                    await db.query(logQuery, [entry[0], entry[1], entry[2]]);
                }
            }
            
            // ===================================================================
            //  ⬆️  FIM DA CORREÇÃO ⬆️
            // ===================================================================

            await interaction.editReply({
                content: `✅ Transferência GLOBAL concluída para **${targetGuild.name}**!\n\n• Sucessos (Forçados a entrar): ${successCount}\n• Falhas (Token expirado/Já estava/Banido): ${failCount}`,
                flags: EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error('Erro na transferência manual em massa (Global):', error);
            await interaction.followUp({
                content: `❌ Erro crítico ao iniciar a transferência: ${error.message}`,
                flags: EPHEMERAL_FLAG
            });
        }
    }
};