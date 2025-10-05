// handlers/buttons/ausencia_request_start.js
module.exports = {
    customId: 'ausencia_request_start',
    async execute(interaction) {
        await interaction.reply({ content: 'O fluxo de solicitação de ausência ainda está em desenvolvimento.', ephemeral: true });
    }
};