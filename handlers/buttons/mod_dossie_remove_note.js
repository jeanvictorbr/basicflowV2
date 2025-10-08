// handlers/buttons/mod_dossie_remove_note.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_dossie_remove_note_',
    async execute(interaction) {
        const targetId = interaction.customId.split('_')[4];
        const notes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [targetId, interaction.guild.id])).rows;

        const options = notes.slice(0, 25).map(note => ({
            label: `Nota de ${new Date(note.created_at).toLocaleDateString()}`,
            description: `Por: ${note.moderator_id} - "${note.content.substring(0, 50)}"`,
            value: note.note_id.toString(),
        }));

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_mod_dossie_remove_note_${targetId}`)
            .setPlaceholder('Selecione a nota a ser removida')
            .addOptions(options);
        
        await interaction.reply({
            content: 'Selecione a nota interna que deseja apagar permanentemente.',
            components: [new ActionRowBuilder().addComponents(selectMenu)],
            ephemeral: true
        });
    }
};