// Crie em: handlers/buttons/store_edit_vitrine_color.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_edit_vitrine_color',
    async execute(interaction) {
        const settings = (await db.query('SELECT store_vitrine_config FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const currentColor = settings.store_vitrine_config?.color || '#5865F2';

        const modal = new ModalBuilder()
            .setCustomId('modal_store_edit_vitrine_color')
            .setTitle('Alterar Cor da Vitrine');

        const colorInput = new TextInputBuilder()
            .setCustomId('input_color')
            .setLabel("Novo Código Hexadecimal da Cor")
            .setStyle(TextInputStyle.Short)
            .setValue(currentColor)
            .setPlaceholder('#FFFFFF')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(colorInput));
        await interaction.showModal(modal);
    }
};