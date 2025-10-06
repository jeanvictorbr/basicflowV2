// Crie em: handlers/selects/select_ai_knowledge_remove.js
const db = require('../../database.js');
const generateAiKnowledgeMenu = require('../../ui/ticketsAiKnowledgeMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_ai_knowledge_remove',
    async execute(interaction) {
        await interaction.deferUpdate();
        const entryId = interaction.values[0];
        await db.query('DELETE FROM ai_knowledge_base WHERE id = $1 AND guild_id = $2', [entryId, interaction.guild.id]);

        const knowledgeEntries = (await db.query('SELECT * FROM ai_knowledge_base WHERE guild_id = $1 ORDER BY topic ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateAiKnowledgeMenu(knowledgeEntries),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};