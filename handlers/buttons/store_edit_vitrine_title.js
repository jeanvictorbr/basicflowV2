// Crie em: handlers/buttons/store_edit_vitrine_title.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_edit_vitrine_title',
    async execute(interaction) {
        const settings = (await db.query('SELECT store_vitrine_config FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const currentTitle = settings.store_vitrine_config?.title || '🏪 Vitrine de Produtos';

        const modal = new ModalBuilder()
            .setCustomId('modal_store_edit_vitrine_title')
            .setTitle('Editar Título da Vitrine');

        const titleInput = new TextInputBuilder()
            .setCustomId('input_title')
            .setLabel("Novo Título")
            .setStyle(TextInputStyle.Short)
            .setValue(currentTitle)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(titleInput));
        await interaction.showModal(modal);
    }
};