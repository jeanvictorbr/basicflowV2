// handlers/selects/select_mod_dossie_remove_note.js
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_mod_dossie_remove_note_',
    async execute(interaction) {
        await interaction.deferUpdate();

        const targetId = interaction.customId.split('_')[5];
        const noteId = interaction.values[0];

        await db.query('DELETE FROM moderation_notes WHERE note_id = $1', [noteId]);

        // Recarrega o dossiê original
        const originalInteraction = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
        
        const member = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!member) { /* ... */ }

        const history = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;
        const newNotes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;

        const dossiePayload = generateDossieEmbed(member, history, newNotes, originalInteraction, { manageMode: true });
        
        await originalInteraction.edit({ components: dossiePayload.components });
        await interaction.editReply({ content: '✅ Nota removida com sucesso!', components: [] });
    }
};