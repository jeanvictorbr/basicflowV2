// handlers/buttons/dev_flow_add_item.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const FEATURES = require('../../config/features.js'); 

module.exports = {
    customId: 'dev_flow_add_item',
    async execute(interaction) {
        // Como FEATURES é uma lista (Array), usamos .map direto
        const options = FEATURES.map(feature => ({
            label: feature.label.substring(0, 100), // Pega o nome "Loja V2", etc.
            description: `Libera: ${feature.value}`,
            value: feature.value, // Pega o ID "STORE", etc.
            emoji: '✨'
        }));

        // Limita a 25 opções (limite do Discord) para não quebrar
        const safeOptions = options.slice(0, 25);

        if (safeOptions.length === 0) {
            return interaction.reply({ 
                content: '❌ Nenhuma feature encontrada em `config/features.js`.', 
                flags: 1 << 6 
            });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId('dev_flow_select_feature')
            .setPlaceholder('Selecione a Feature que este item vai liberar')
            .addOptions(safeOptions);

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({
            content: '💎 **Novo Item da Loja Flow**\n\nSelecione qual funcionalidade este produto deve liberar:',
            components: [row],
            flags: 1 << 6 
        });
    }
};