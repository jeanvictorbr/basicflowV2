// handlers/buttons/registros_iniciar_registro.js
module.exports = {
    customId: 'registros_iniciar_registro',
    async execute(interaction) {
        await interaction.reply({ content: 'O fluxo de registro de usuário ainda está em desenvolvimento.', ephemeral: true });
    }
};