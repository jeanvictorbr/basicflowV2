// Crie em: handlers/modals/modal_dev_guild_set_maintenance_message_.js
const db = require('../../database.js');

module.exports = {
    customId: 'modal_dev_guild_set_maintenance_message_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const guildId = interaction.customId.split('_')[6];
        const messageContent = interaction.fields.getTextInputValue('input_message_guild');

        await db.query(
            "UPDATE guild_settings SET maintenance_message_guild = $1 WHERE guild_id = $2",
            [messageContent, guildId]
        );

        await interaction.editReply({ content: '✅ Mensagem de manutenção para esta guilda foi atualizada com sucesso!' });
    }
};