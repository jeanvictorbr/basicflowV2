// handlers/buttons/dev_flow_add_item.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const FEATURES = require('../../config/features.js'); // Importa o mapa de features

module.exports = {
    customId: 'dev_flow_add_item',
    async execute(interaction) {
        // Gera as opções do menu baseadas no arquivo de configuração
        // [CORREÇÃO] Adicionado .filter() e fallback para garantir que label e value nunca sejam undefined
        const options = Object.entries(FEATURES)
            .filter(([key, feature]) => feature && typeof feature === 'object') // Ignora entradas inválidas
            .map(([key, feature]) => ({
                label: feature.name ? String(feature.name).substring(0, 100) : `Feature: ${key}`, // Fallback seguro
                description: feature.description ? String(feature.description).substring(0, 100) : `Ativa o módulo ${key}`,
                value: String(key), // Garante que seja string
                emoji: '✨'
            }));

        // Se não houver opções válidas, avisa o dev
        if (options.length === 0) {
            return interaction.reply({ 
                content: '❌ Nenhuma feature configurada corretamente em `config/features.js`. Verifique o arquivo.', 
                flags: 1 << 6 
            });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId('dev_flow_select_feature')
            .setPlaceholder('Selecione a Feature que este item vai liberar')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({
            content: '💎 **Novo Item da Loja Flow**\n\nSelecione qual funcionalidade este produto deve liberar para o servidor que comprar:',
            components: [row],
            flags: 1 << 6 // Substitui ephemeral: true (V2 Flag)
        });
    }
};