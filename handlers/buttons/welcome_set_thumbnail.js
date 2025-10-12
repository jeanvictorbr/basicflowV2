// handlers/buttons/welcome_set_thumbnail.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');
const hasFeature = require('../../utils/featureCheck.js');

module.exports = {
    customId: 'welcome_set_thumbnail',
    async execute(interaction) {
        if (!await hasFeature(interaction.guild.id, 'CUSTOM_VISUALS')) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium.', ephemeral: true });
        }
        const settings = (await db.query('SELECT welcome_message_config FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const config = settings.welcome_message_config || {};

        const modal = new ModalBuilder().setCustomId('modal_welcome_set_thumbnail').setTitle('Editar Thumbnail (Premium)');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_thumbnail_url').setLabel("URL da Thumbnail").setStyle(TextInputStyle.Short).setValue(config.thumbnail_url || '').setRequired(false))
        );
        await interaction.showModal(modal);
    }
};