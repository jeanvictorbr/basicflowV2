// Crie em: handlers/selects/select_ai_knowledge_edit.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'select_ai_knowledge_edit',
    async execute(interaction) {
        const entryId = interaction.values[0];
        const entry = (await db.query('SELECT * FROM ai_knowledge_base WHERE id = $1', [entryId])).rows[0];
        
        const modal = new ModalBuilder().setCustomId(`modal_ai_knowledge_edit_${entryId}`).setTitle(`Editando: ${entry.topic}`);
        const topicInput = new TextInputBuilder().setCustomId('input_topic').setLabel("Tópico").setStyle(TextInputStyle.Short).setValue(entry.topic).setRequired(true);
        const keywordsInput = new TextInputBuilder().setCustomId('input_keywords').setLabel("Palavras-chave (separadas por vírgula)").setStyle(TextInputStyle.Short).setValue(entry.keywords).setRequired(true);
        const contentInput = new TextInputBuilder().setCustomId('input_content').setLabel("Conteúdo da Informação").setStyle(TextInputStyle.Paragraph).setValue(entry.content).setRequired(true);
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(topicInput),
            new ActionRowBuilder().addComponents(keywordsInput),
            new ActionRowBuilder().addComponents(contentInput)
        );
        await interaction.showModal(modal);
    }
};