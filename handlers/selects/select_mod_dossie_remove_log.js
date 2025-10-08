// handlers/selects/select_mod_dossie_remove_log.js
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'select_mod_dossie_remove_log_',
    async execute(interaction) {
        await interaction.deferUpdate();

        const targetId = interaction.customId.split('_')[5];
        const caseId = interaction.values[0];

        await db.query('DELETE FROM moderation_logs WHERE case_id = $1', [caseId]);

        const originalInteraction = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
        
        const member = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!member) { /* ... */ }

        const newHistory = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;
        const notes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;

        const dossiePayload = generateDossieEmbed(member, newHistory, notes, originalInteraction, { manageMode: true });
        
        await originalInteraction.edit({ components: dossiePayload.components });
        await interaction.editReply({ content: '✅ Ocorrência removida com sucesso!', components: [] });
    }
};