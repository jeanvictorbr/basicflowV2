// File: handlers/selects/membros_select_user_.js
const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { getManageUserMenu } = require('../../ui/membros/manageUserMenu.js');

module.exports = {
    customId: 'membros_select_user_',
    async execute(interaction) {
        const [, , , scope] = interaction.customId.split('_');
        const userId = interaction.values[0];
        const guildId = interaction.guild.id;

        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });

        try {
            // Buscar dados do usuário pela API
            let userData;
            try {
                const user = await interaction.client.users.fetch(userId);
                userData = { 
                    user_id: user.id, 
                    username: user.username,
                    global_level: 'N/A', // Não temos essa info no schema
                    global_xp: 'N/A' // Não temos essa info no schema
                }; 
            } catch {
                return interaction.editReply({ 
                    type: 17, flags: V2_FLAG | EPHEMERAL_FLAG, accent_color: 0xED4245,
                    components: [{ "type": 10, "content": "❌ Não foi possível encontrar este usuário no Discord." }]
                });
            }
            
            // Tabela 'cloudflow_verified_users' (Corrigido na resposta anterior)
            const registroResult = await db.query(
                'SELECT * FROM cloudflow_verified_users WHERE guild_id = $1 AND user_id = $2',
                [guildId, userId]
            );
            const registroData = registroResult.rows.length > 0 ? registroResult.rows[0] : null;

            // ===== CORREÇÃO AQUI =====
            // Em vez de consultar 'guild_bans', vamos checar a API do Discord
            let banData = null;
            try {
                const ban = await interaction.guild.bans.fetch(userId);
                if (ban) {
                    // Simula a estrutura de dados que a UI esperava
                    banData = { reason: ban.reason || 'Sem motivo', moderator_id: 'N/A (API)' };
                }
            } catch (e) {
                // Se der erro (404), o usuário não está banido
            }
            // ===== FIM DA CORREÇÃO =====

            let guildMember = null;
            try {
                guildMember = await interaction.guild.members.fetch(userId);
            } catch (e) { /* Não está no servidor */ }
            
            const isDev = interaction.user.id === process.env.DEV_ID;

            // Esta UI (ui/membros/manageUserMenu.js) está correta (versão V2 Pura)
            const menu = getManageUserMenu(userData, registroData, banData, guildMember, scope, isDev);
            await interaction.editReply(menu);

        } catch (error) {
            console.error('Erro ao selecionar usuário para gerenciar:', error);
            await interaction.editReply({ 
                type: 17, flags: V2_FLAG | EPHEMERAL_FLAG, accent_color: 0xED4245,
                components: [{ "type": 10, "content": "❌ Ocorreu um erro ao carregar os dados deste usuário." }]
            });
        }
    }
};