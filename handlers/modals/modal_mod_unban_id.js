// Crie em: handlers/modals/modal_mod_unban_id.js
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
            
            await db.query("DELETE FROM moderation_logs WHERE guild_id = $1 AND user_id = $2 AND action = 'BAN' AND duration IS NOT NULL", [interaction.guild.id, userId]);

            await interaction.editReply({ content: `✅ O banimento do usuário \`${userId}\` foi revogado com sucesso.` });

            // Atualiza o dashboard de bans que está na mensagem anterior
            const bans = await interaction.guild.bans.fetch();
            const bannedUsers = Array.from(bans.values());
            await interaction.message.edit({
                components: generateModeracaoBansMenu(bannedUsers)
            });

        } catch (error) {
            console.error('[MOD UNBAN] Erro ao revogar ban:', error);
            await interaction.editReply({ content: '❌ Falha ao revogar o banimento. Verifique se o ID está correto e se eu tenho permissão para desbanir membros.' });
        }
    }
};