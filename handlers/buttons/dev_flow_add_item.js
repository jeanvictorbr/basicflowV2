const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const FEATURES = require('../../config/features.js'); // Importação dinâmica

module.exports = {
    customId: 'dev_flow_add_item',
    async execute(interaction) {
        const options = [];

        // Itera sobre todas as chaves exportadas no features.js
        // Suporta tanto formato de Objeto { KEY: { name: ... } } quanto Array
        for (const key in FEATURES) {
            const feat = FEATURES[key];
            
            // Tenta obter nome e descrição, ou usa a própria chave como fallback
            const label = feat.name || feat.title || key;
            const desc = feat.description || feat.desc || `Chave: ${key}`;
            
            options.push({
                label: label.substring(0, 100), // Limite do Discord
                value: key,
                description: desc.substring(0, 100),
                emoji: feat.emoji || '✨'
            });
        }

        // Proteção contra limite de 25 opções do Discord
        const finalOptions = options.slice(0, 25);

        if (finalOptions.length === 0) {
            return interaction.reply({ content: "⚠️ Nenhuma feature encontrada em `config/features.js`.", ephemeral: true });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId('dev_flow_select_feature')
            .setPlaceholder('Selecione a feature para vender')
            .addOptions(finalOptions);

        await interaction.reply({
            content: "🛠️ **Passo 1/2:** Selecione qual funcionalidade do sistema será vendida:",
            components: [new ActionRowBuilder().addComponents(select)],
            ephemeral: true
        });
    }
};