const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'dev_search_user_start',
    async execute(interaction) {
        // Como o modal é uma resposta direta, não podemos usar deferReply antes
        // Criamos o modal usando Builders (permitido aqui pois é construção de objeto, não UI response direta V2 complexa)
        
        const modal = new ModalBuilder()
            .setCustomId('modal_dev_search_user_submit')
            .setTitle('🔍 Localizar Usuário em Guildas');

        const idInput = new TextInputBuilder()
            .setCustomId('target_user_id')
            .setLabel('ID do Usuário')
            .setPlaceholder('Ex: 123456789012345678')
            .setStyle(TextInputStyle.Short)
            .setMinLength(17)
            .setMaxLength(20)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(idInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};