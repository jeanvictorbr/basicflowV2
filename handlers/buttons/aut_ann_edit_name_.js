// Novo Arquivo: handlers/buttons/aut_ann_edit_name_.js
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database');

module.exports = {
    customId: 'aut_ann_edit_name_',
    async execute(interaction) {
        const annId = interaction.customId.split('_').pop();

        const { rows } = await db.query('SELECT name FROM automations_announcements WHERE announcement_id = $1', [annId]);
        if (rows.length === 0) {
            return interaction.reply({ 
                content: '❌ Este anúncio não foi encontrado. Pode ter sido excluído.', 
                ephemeral: true 
            });
        }

        const modal = new ModalBuilder()
            .setCustomId(`aut_ann_edit_name_modal_${annId}`)
            .setTitle('Editar Nome do Anúncio');

        const nameInput = new TextInputBuilder()
            .setCustomId('aut_ann_name')
            .setLabel('Nome de Identificação (só você vê)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100)
            .setValue(rows[0].name);

        modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
        await interaction.showModal(modal);
    }
};