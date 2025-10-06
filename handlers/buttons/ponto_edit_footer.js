const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'ponto_edit_footer',
    async execute(interaction) {
        const settings = (await db.query('SELECT ponto_vitrine_footer FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const modal = new ModalBuilder().setCustomId('modal_ponto_edit_footer').setTitle('Editar Rodapé da Vitrine');
        const footerInput = new TextInputBuilder()
            .setCustomId('input_footer')
            .setLabel("Texto do rodapé")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ex: © Nome do Servidor 2025')
            .setValue(settings?.ponto_vitrine_footer || '')
            .setRequired(false);
        modal.addComponents(new ActionRowBuilder().addComponents(footerInput));
        await interaction.showModal(modal);
    }
};