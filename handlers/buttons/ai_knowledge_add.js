// Crie em: handlers/buttons/ai_knowledge_add.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'ai_knowledge_add',
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId('modal_ai_knowledge_add').setTitle('Adicionar Conhecimento à IA');
        const topicInput = new TextInputBuilder().setCustomId('input_topic').setLabel("Tópico").setStyle(TextInputStyle.Short).setPlaceholder("Ex: Sistema de Bate-Ponto").setRequired(true);
        const keywordsInput = new TextInputBuilder().setCustomId('input_keywords').setLabel("Palavras-chave (separadas por vírgula)").setStyle(TextInputStyle.Short).setPlaceholder("ponto, horas, serviço, afk").setRequired(true);
        const contentInput = new TextInputBuilder().setCustomId('input_content').setLabel("Conteúdo da Informação").setStyle(TextInputStyle.Paragraph).setPlaceholder("Explique detalhadamente como a funcionalidade opera...").setRequired(true);
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(topicInput),
            new ActionRowBuilder().addComponents(keywordsInput),
            new ActionRowBuilder().addComponents(contentInput)
        );
        await interaction.showModal(modal);
    }
};