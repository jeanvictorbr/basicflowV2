// Crie em: handlers/buttons/tickets_ai_manage_knowledge.js
const db = require('../../database.js');
const generateAiKnowledgeMenu = require('../../ui/ticketsAiKnowledgeMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_ai_manage_knowledge',
    async execute(interaction) {
        await interaction.deferUpdate();
        const knowledgeEntries = (await db.query('SELECT * FROM ai_knowledge_base WHERE guild_id = $1 ORDER BY topic ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateAiKnowledgeMenu(knowledgeEntries),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};