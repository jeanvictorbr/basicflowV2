// handlers/modals/modal_mod_unban_id.js
const db = require('../../database.js');
const generateModeracaoBansMenu = require('../../ui/moderacaoBansMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_mod_unban_id',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const userId = interaction.fields.getTextInputValue('input_user_id');

        try {
            await interaction.guild.members.unban(userId, `Revogado por: ${interaction.user.tag}`);
            
            // Remove o registro de ban do log de moderação, já que não está mais ativo
            await db.query("DELETE FROM moderation_logs WHERE guild_id = $1 AND user_id = $2 AND action = 'BAN'", [interaction.guild.id, userId]);

            // Informa o sucesso. O usuário pode reabrir o dashboard para ver a lista atualizada.
            await interaction.editReply({ content: `✅ O banimento do usuário \`${userId}\` foi revogado com sucesso.` });

        } catch (error) {
            console.error('[MOD UNBAN] Erro ao revogar ban:', error);
            // Trata o erro específico de "Unknown Ban" que pode ocorrer se o ban já foi revogado manualmente
            if (error.code === 10026) { // Unknown Ban
                 await interaction.editReply({ content: '⚠️ O usuário com este ID não está banido.' });
            } else {
                await interaction.editReply({ content: '❌ Falha ao revogar o banimento. Verifique se o ID está correto e se eu tenho permissão para desbanir membros.' });
            }
        }
    }
};