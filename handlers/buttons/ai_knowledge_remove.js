// Crie em: handlers/buttons/ai_knowledge_remove.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ai_knowledge_remove',
    async execute(interaction) {
        const entries = (await db.query('SELECT id, topic FROM ai_knowledge_base WHERE guild_id = $1 ORDER BY topic ASC', [interaction.guild.id])).rows;
        const options = entries.map(e => ({ label: e.topic, value: String(e.id), description: `ID: ${e.id}` }));
        const selectMenu = new StringSelectMenuBuilder().setCustomId('select_ai_knowledge_remove').setPlaceholder('Selecione a entrada para remover').addOptions(options);
        const cancelButton = new ButtonBuilder().setCustomId('tickets_ai_manage_knowledge').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};