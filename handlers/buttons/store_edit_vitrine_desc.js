// Crie em: handlers/buttons/store_edit_vitrine_desc.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_edit_vitrine_desc',
    async execute(interaction) {
        const settings = (await db.query('SELECT store_vitrine_config FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const currentDesc = settings.store_vitrine_config?.description || 'Selecione um item no menu abaixo para ver os detalhes e iniciar a sua compra.';

        const modal = new ModalBuilder()
            .setCustomId('modal_store_edit_vitrine_desc')
            .setTitle('Editar Descrição da Vitrine');

        const descInput = new TextInputBuilder()
            .setCustomId('input_desc')
            .setLabel("Nova Descrição")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(currentDesc)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(descInput));
        await interaction.showModal(modal);
    }
};