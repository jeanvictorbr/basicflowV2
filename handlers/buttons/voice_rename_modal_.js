const db = require('../../database.js'); // Importação obrigatória
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'voice_rename_modal_',
    async execute(interaction) {
        const channelId = interaction.customId.split('_').pop();

        const check = await db.query('SELECT owner_id FROM temp_voices WHERE channel_id = $1', [channelId]);
        if (check.rows.length === 0 || check.rows[0].owner_id !== interaction.user.id) {
            return interaction.reply({ content: "❌ Apenas o dono pode renomear.", ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId(`voice_rename_submit_${channelId}`)
            .setTitle('Renomear Sala');

        const nameInput = new TextInputBuilder()
            .setCustomId('new_name')
            .setLabel("Novo nome da sala")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(30)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
        await interaction.showModal(modal);
    }
};