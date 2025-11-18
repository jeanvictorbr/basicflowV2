// File: handlers/buttons/membros_user_kick_.js
// (MODIFICADO: Ação 'kick' removida e substituída por 'DELETE' no DB)

const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { getManageUserMenu } = require('../../ui/membros/manageUserMenu.js'); // Importa a UI

module.exports = {
    customId: 'membros_user_kick_', // (Mantemos o customId, embora o nome esteja confuso)

    async execute(interaction) {
        
        try {
            // 1. Parsear o ID (Mantendo a correção da ordem: SCOPE, USERID)
            const [, , , scope, userId] = interaction.customId.split('_');
            const guildId = interaction.guild.id;

            await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });

            // 2. CORREÇÃO DE LÓGICA: Remover a verificação do DB, NÃO expulsar
            const deleteResult = await db.query(
                'DELETE FROM cloudflow_verified_users WHERE guild_id = $1 AND user_id = $2',
                [guildId, userId]
            );

            if (deleteResult.rowCount === 0) {
                // Se não deletou nada, é porque já não estava lá
                return interaction.followUp({ 
                    content: '⚠️ O usuário já não estava com a verificação (CloudFlow) registrada para esta guilda.', 
                    flags: EPHEMERAL_FLAG 
                });
            }

            // 3. Buscar os dados NOVAMENTE para atualizar a UI
            // (O membro ainda está na guilda, mas o 'registroData' agora será null)

            // 3.1. Buscar dados do usuário (API)
            let userData;
            try {
                const user = await interaction.client.users.fetch(userId);
                userData = { user_id: user.id, username: user.username, global_level: 'N/A', global_xp: 'N/A' }; 
            } catch {
                userData = { user_id: userId, username: 'Usuário (API Falhou)', global_level: 'N/A', global_xp: 'N/A' };
            }
            
            // 3.2. Buscar registro no DB (AGORA SERÁ NULL)
            const registroResult = await db.query(
                'SELECT * FROM cloudflow_verified_users WHERE guild_id = $1 AND user_id = $2',
                [guildId, userId]
            );
            const registroData = registroResult.rows.length > 0 ? registroResult.rows[0] : null;

            // 3.3. Verificar Ban (API)
            let banData = null;
            try {
                const ban = await interaction.guild.bans.fetch(userId);
                if (ban) {
                    banData = { reason: ban.reason || 'Sem motivo', moderator_id: 'N/A (API)' };
                }
            } catch (e) { /* Não banido */ }

            // 3.4. Verificar Membro (Ele AINDA está no servidor)
            let guildMember = null; 
            try {
                guildMember = await interaction.guild.members.fetch(userId);
            } catch (e) { /* Pode ter saído por conta própria, mas não o expulsamos */ }
            
            const isDev = interaction.user.id === process.env.DEV_ID;

            // 4. Chamar a UI DIRETAMENTE com os dados atualizados
            const menu = getManageUserMenu(userData, registroData, banData, guildMember, scope, isDev);
            await interaction.editReply(menu);

            // 5. Enviar confirmação correta
            await interaction.followUp({ 
                content: `✅ Verificação CloudFlow removida para ${userData.username} (${userId}). O membro continua no servidor.`, 
                flags: EPHEMERAL_FLAG 
            });

        } catch (error) {
            console.error('Erro CRÍTICO ao remover verificação:', error);
            await interaction.editReply({ 
                type: 17, flags: V2_FLAG | EPHEMERAL_FLAG, accent_color: 0xED4245,
                components: [{ "type": 10, "content": "❌ Ocorreu um erro ao processar a remoção da verificação." }]
            });
        }
    }
};