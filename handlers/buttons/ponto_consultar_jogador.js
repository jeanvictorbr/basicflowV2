// handlers/buttons/ponto_consultar_jogador.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'ponto_consultar_jogador',
    async execute(interaction) {
        // Garante que apenas administradores possam usar
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar esta função.', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId('modal_ponto_consultar_jogador')
            .setTitle('Consultar Ponto de Jogador');

        const userIdInput = new TextInputBuilder()
            .setCustomId('input_user_id')
            .setLabel("ID do Usuário ou Menção")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 373931342972321793 ou @usuario')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(userIdInput));
        await interaction.showModal(modal);
    }
};