// Crie em: handlers/modals/modal_ai_knowledge_edit.js
const db = require('../../database.js');
const generateAiKnowledgeMenu = require('../../ui/ticketsAiKnowledgeMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_ai_knowledge_edit_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const entryId = interaction.customId.split('_')[4];
        const topic = interaction.fields.getTextInputValue('input_topic');
        const keywords = interaction.fields.getTextInputValue('input_keywords');
        const content = interaction.fields.getTextInputValue('input_content');

        await db.query(
            'UPDATE ai_knowledge_base SET topic = $1, keywords = $2, content = $3 WHERE id = $4 AND guild_id = $5',
            [topic, keywords, content, entryId, interaction.guild.id]
        );

        const knowledgeEntries = (await db.query('SELECT * FROM ai_knowledge_base WHERE guild_id = $1 ORDER BY topic ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateAiKnowledgeMenu(knowledgeEntries),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};