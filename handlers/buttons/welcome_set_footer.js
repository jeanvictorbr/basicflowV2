// handlers/buttons/welcome_set_footer.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');
const hasFeature = require('../../utils/featureCheck.js');

module.exports = {
    customId: 'welcome_set_footer',
    async execute(interaction) {
        if (!await hasFeature(interaction.guild.id, 'CUSTOM_VISUALS')) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium.', ephemeral: true });
        }
        const settings = (await db.query('SELECT welcome_message_config FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const config = settings.welcome_message_config || {};

        const modal = new ModalBuilder().setCustomId('modal_welcome_set_footer').setTitle('Editar Rodapé (Premium)');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_footer_text').setLabel("Texto do Rodapé").setStyle(TextInputStyle.Short).setValue(config.footer_text || '').setRequired(false))
        );
        await interaction.showModal(modal);
    }
};