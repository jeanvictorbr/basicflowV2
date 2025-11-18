// Local: handlers/buttons/membros_transfer_user_.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    // O underscore no final indica que é um ID dinâmico (ex: membros_transfer_user_123456789)
    customId: 'membros_transfer_user_',
    async execute(interaction) {
        // 1. Extrair o ID do usuário alvo do botão clicado
        const targetUserId = interaction.customId.split('_').pop();

        // 2. Criar o Modal
        // Passamos o ID do usuário no customId do modal para recuperar depois
        const modal = new ModalBuilder()
            .setCustomId(`modal_membros_transfer_user_${targetUserId}`)
            .setTitle('Transferir Usuário (CloudFlow)');

        // 3. Criar o Input para o ID do Servidor
        const guildInput = new TextInputBuilder()
            .setCustomId('target_guild_id')
            .setLabel('ID do Servidor de Destino')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Cole o ID do servidor aqui...')
            .setRequired(true)
            .setMinLength(17)
            .setMaxLength(20);

        const row = new ActionRowBuilder().addComponents(guildInput);
        modal.addComponents(row);

        // 4. Mostrar o Modal
        await interaction.showModal(modal);
    },
};