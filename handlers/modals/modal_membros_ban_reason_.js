// File: handlers/modals/modal_membros_ban_reason_.js
const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'modal_membros_ban_reason_',
    async execute(interaction) {
        const [, , , , scope, userId] = interaction.customId.split('_');
        const reason = interaction.fields.getTextInputValue('reason');
        const moderatorId = interaction.user.id;
        const guildId = interaction.guild.id;

        await interaction.deferReply({ flags: EPHEMERAL_FLAG });

        try {
            // 1. Tenta banir da guilda via API (Correto)
            await interaction.guild.members.ban(userId, { reason: `[Painel de Membros] ${reason}` });

            // 2. CORREÇÃO: Logar na 'moderation_logs' (que existe no schema)
            await db.query(
                `INSERT INTO moderation_logs (guild_id, user_id, moderator_id, action, reason) 
                 VALUES ($1, $2, $3, 'ban', $4)`,
                [guildId, userId, moderatorId, reason]
            );

            // 3. Remove da 'cloudflow_verified_users' (Correto)
            await db.query(
                'DELETE FROM cloudflow_verified_users WHERE guild_id = $1 AND user_id = $2',
                [guildId, userId]
            );

            await interaction.editReply({
                content: `✅ Usuário <@${userId}> foi banido com sucesso.`,
                flags: EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error('Erro ao banir membro:', error);
            await interaction.editReply({
                content: `❌ Ocorreu um erro ao tentar banir o membro. \n\`${error.message}\``,
                flags: EPHEMERAL_FLAG
            });
        }
    }
};