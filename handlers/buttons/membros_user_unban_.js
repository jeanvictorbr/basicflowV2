// File: handlers/buttons/membros_user_unban_.js
const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'membros_user_unban_',
    async execute(interaction) {
        const [, , , scope, userId] = interaction.customId.split('_');
        const guildId = interaction.guild.id;
        const moderatorId = interaction.user.id;

        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });

        try {
            // 1. Tenta desbanir da guilda via API (Correto)
            await interaction.guild.bans.remove(userId, `[Painel de Membros] Desbanido por ${interaction.user.tag}`);

            // 2. CORREÇÃO: Logar a ação na 'moderation_logs'
            await db.query(
                `INSERT INTO moderation_logs (guild_id, user_id, moderator_id, action, reason) 
                 VALUES ($1, $2, $3, 'unban', $4)`,
                [guildId, userId, moderatorId, '[Painel de Membros]']
            );
            
            const content = `✅ Usuário <@${userId}> foi desbanido com sucesso e a ação foi registrada.`;

            // 3. Recarrega o menu do usuário (chamando a lógica do select)
            const selectHandler = interaction.client.selects.get('membros_select_user_');
            if (selectHandler) {
                const fakeSelectInteraction = { ...interaction, values: [userId], customId: `membros_select_user_${scope}` };
                await selectHandler.execute(fakeSelectInteraction);
                
                await interaction.followUp({ content, flags: EPHEMERAL_FLAG });
            } else {
                // Fallback caso o handler do select falhe
                await interaction.editReply({ 
                    type: 17, flags: V2_FLAG | EPHEMERAL_FLAG, accent_color: 0x57F287,
                    components: [{ "type": 10, "content": content }]
                });
            }

        } catch (error) {
            console.error('Erro ao desbanir membro:', error);
            await interaction.followUp({
                content: `❌ Ocorreu um erro ao tentar desbanir o membro. \n\`${error.message}\``,
                flags: EPHEMERAL_FLAG
            });
        }
    }
};