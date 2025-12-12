// handlers/buttons/dev_flow_add_item.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const FEATURES = require('../../config/features.js'); // Importa o mapa de features

module.exports = {
    customId: 'dev_flow_add_item',
    async execute(interaction) {
        // Gera as opções do menu baseadas no arquivo de configuração
        const options = Object.entries(FEATURES).map(([key, feature]) => ({
            label: feature.name, // Ex: "Loja V2 (Premium)"
            description: feature.description ? feature.description.substring(0, 100) : `Ativa o módulo ${key}`,
            value: key, // Ex: "STORE_V2"
            emoji: '✨'
        }));

        const select = new StringSelectMenuBuilder()
            .setCustomId('dev_flow_select_feature')
            .setPlaceholder('Selecione a Feature que este item vai liberar')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({
            content: '💎 **Novo Item da Loja Flow**\n\nSelecione qual funcionalidade este produto deve liberar para o servidor que comprar:',
            components: [row],
            ephemeral: true
        });
    }
};