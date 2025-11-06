// ui/devPanel/devKeysMenu.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
// REMOVIDO: const db = require('../../database'); // NÃO FAÇA QUERIES NA UI

/**
 * Gera o menu de chaves (Versão Legacy, usando Builders)
 * @param {Array} keys - As chaves (rows do db) a serem exibidas.
 * @param {number} page - A página atual (0-indexada).
 * @param {number} totalKeys - O número total de chaves.
 * @param {number} totalPages - O número total de páginas.
 */
function generateDevKeysMenu(keys, page, totalKeys, totalPages) {
    
    // CORREÇÃO: Os dados agora vêm do handler.
    // 'page' agora é 0-indexada, então somamos 1 para exibição.
    const embed = new EmbedBuilder()
        .setColor(0x0099FF) // Azul
        .setTitle('Painel de Gestão de Keys')
        .setFooter({ text: `Página ${page + 1} de ${totalPages}` });

    if (keys.length > 0) {
        // CORREÇÃO: Usando os nomes corretos das colunas do schema 'activation_keys'
        // O schema original estava errado ('premium_keys', 'key_value', etc.)
        const keyList = keys.map(key => {
            const features = key.grants_features ? (Array.isArray(key.grants_features) ? key.grants_features.join(', ') : key.grants_features) : 'N/A';
            return `\`${key.key}\` - ${features} (${key.duration_days}d) | Usos: ${key.uses_left}`;
        }).join('\n');
        embed.setDescription(`**Chaves Ativas (${totalKeys}):**\n${keyList}`);
    } else {
        embed.setDescription('Nenhuma chave ativa encontrada.');
    }

    // Botões
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('dev_key_create').setLabel('Gerar Key Única').setStyle(ButtonStyle.Success).setEmoji('🔑'),
            new ButtonBuilder().setCustomId('dev_open_bulk_keys').setLabel('Gerar Keys em Massa').setStyle(ButtonStyle.Primary).setEmoji('📦'),
            new ButtonBuilder().setCustomId('dev_key_revoke').setLabel('Revogar Keys').setStyle(ButtonStyle.Danger).setEmoji('✖️')
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('dev_open_key_stats').setLabel('Estatísticas').setStyle(ButtonStyle.Secondary).setEmoji('📊'),
            new ButtonBuilder().setCustomId('dev_open_key_history').setLabel('Histórico de Ativação').setStyle(ButtonStyle.Secondary).setEmoji('📜')
        );

    // Navegação (CORREÇÃO: 'page' é 0-indexada)
    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId(`dev_keys_page_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
            new ButtonBuilder().setCustomId(`dev_keys_page_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages),
            new ButtonBuilder().setCustomId('dev_main_menu_back').setLabel('Voltar ao Menu Principal').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
        );

    // Retorna o objeto legacy (sem 'data' ou 'type: 17')
    return { embeds: [embed], components: [row, row2, row3] };
}

module.exports = generateDevKeysMenu;