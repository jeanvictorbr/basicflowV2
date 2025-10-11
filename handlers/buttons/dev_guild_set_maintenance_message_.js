// Crie em: handlers/buttons/dev_guild_set_maintenance_message_.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'dev_guild_set_maintenance_message_',
    async execute(interaction) {
        const guildId = interaction.customId.split('_')[5];
        const settings = (await db.query("SELECT maintenance_message_guild FROM guild_settings WHERE guild_id = $1", [guildId])).rows[0];

        const modal = new ModalBuilder()
            .setCustomId(`modal_dev_guild_set_maintenance_message_${guildId}`)
            .setTitle('Mensagem de Manutenção da Guilda');

        const messageInput = new TextInputBuilder()
            .setCustomId('input_message_guild')
            .setLabel("Mensagem para esta guilda")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ex: Estamos realizando uma manutenção específica neste servidor.')
            .setValue(settings?.maintenance_message_guild || '')
            .setRequired(false);

        modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
        await interaction.showModal(modal);
    }
};