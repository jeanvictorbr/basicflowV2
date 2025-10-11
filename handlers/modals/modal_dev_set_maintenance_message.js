// Crie em: handlers/modals/modal_dev_set_maintenance_message.js
const db = require('../../database.js');

module.exports = {
    customId: 'modal_dev_set_maintenance_message',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const messageContent = interaction.fields.getTextInputValue('input_message');

        await db.query(
            "UPDATE bot_status SET maintenance_message = $1 WHERE status_key = 'main'",
            [messageContent]
        );

        await interaction.editReply({ content: '✅ Mensagem de manutenção global atualizada com sucesso!' });
    }
};