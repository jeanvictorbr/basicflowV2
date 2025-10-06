// utils/aiKnowledgeBase.js
const db = require('../database.js');

async function searchKnowledge(guildId, query) {
    if (!query) return '';

    // Busca todas as entradas de conhecimento para a guild
    const allKnowledge = (await db.query('SELECT keywords, content FROM ai_knowledge_base WHERE guild_id = $1', [guildId])).rows;
    if (allKnowledge.length === 0) return '';

    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2); // Ignora palavras muito curtas
    const foundTopics = new Set();

    allKnowledge.forEach(item => {
        const keywords = item.keywords.toLowerCase().split(',').map(k => k.trim());
        for (const keyword of keywords) {
            if (queryWords.some(word => keyword.includes(word) || word.includes(keyword))) {
                foundTopics.add(item.content);
                break;
            }
        }
    });

    return Array.from(foundTopics).join('\n\n---\n\n');
}

module.exports = { searchKnowledge };