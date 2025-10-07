// handlers/buttons/guardian_config_actions.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'guardian_config_actions',
    async execute(interaction) {
        const settings = (await db.query('SELECT guardian_ai_intervention_message FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        const modal = new ModalBuilder()
            .setCustomId('modal_guardian_actions')
            .setTitle('Customizar Mensagem de Intervenção');

        const defaultMessage = "Lembrete amigável do nosso Guardião: Vamos manter a conversa respeitosa e construtiva, pessoal. Foco nas ideias, não nos ataques. 🙂";

        const messageInput = new TextInputBuilder()
            .setCustomId('input_intervention_message')
            .setLabel("Mensagem que o bot enviará no chat")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(settings.guardian_ai_intervention_message || defaultMessage)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
        await interaction.showModal(modal);
    }
};