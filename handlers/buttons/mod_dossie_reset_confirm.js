// handlers/buttons/mod_dossie_reset_confirm.js
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'mod_dossie_reset_confirm_',
    async execute(interaction) {
        await interaction.deferUpdate();

        const targetId = interaction.customId.split('_')[4];
        
        await db.query('DELETE FROM moderation_logs WHERE user_id = $1 AND guild_id = $2', [targetId, interaction.guild.id]);

        const originalInteraction = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
        
        const member = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!member) { /* ... */ }

        const notes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;

        const dossiePayload = generateDossieEmbed(member, [], notes, originalInteraction, { manageMode: true });
        
        await originalInteraction.edit({ components: dossiePayload.components });
        await interaction.editReply({ content: '✅ Histórico de moderação do usuário foi resetado com sucesso!', components: [] });
    }
};