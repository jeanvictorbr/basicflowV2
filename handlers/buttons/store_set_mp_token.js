// handlers/buttons/store_set_mp_token.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_set_mp_token',
    async execute(interaction) {
        const settings = (await db.query('SELECT store_mp_token FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};

        const modal = new ModalBuilder()
            .setCustomId('modal_store_set_mp_token')
            .setTitle('Token de Acesso do Mercado Pago');

        const tokenInput = new TextInputBuilder()
            .setCustomId('input_mp_token')
            .setLabel("Seu Access Token de Produção")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('APP_USR-...')
            .setValue(settings.store_mp_token || '')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(tokenInput));
        await interaction.showModal(modal);
    }
};