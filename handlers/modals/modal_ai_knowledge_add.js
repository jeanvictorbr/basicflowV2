// Crie em: handlers/modals/modal_ai_knowledge_add.js
const db = require('../../database.js');
const generateAiKnowledgeMenu = require('../../ui/ticketsAiKnowledgeMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_ai_knowledge_add',
    async execute(interaction) {
        await interaction.deferUpdate();
        const topic = interaction.fields.getTextInputValue('input_topic');
        const keywords = interaction.fields.getTextInputValue('input_keywords');
        const content = interaction.fields.getTextInputValue('input_content');

        await db.query(
            'INSERT INTO ai_knowledge_base (guild_id, topic, keywords, content) VALUES ($1, $2, $3, $4)',
            [interaction.guild.id, topic, keywords, content]
        );

        const knowledgeEntries = (await db.query('SELECT * FROM ai_knowledge_base WHERE guild_id = $1 ORDER BY topic ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateAiKnowledgeMenu(knowledgeEntries),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};