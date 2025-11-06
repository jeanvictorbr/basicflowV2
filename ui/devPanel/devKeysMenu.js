// Em: ui/devPanel/devKeysMenu.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database'); // Ajuste o caminho se necessário

async function generateDevKeysMenu(page = 1) {
    const itemsPerPage = 10;
    const offset = (page - 1) * itemsPerPage;

    const keysResult = await db.query('SELECT * FROM premium_keys WHERE is_used = false LIMIT $1 OFFSET $2', [itemsPerPage, offset]);
    const keys = keysResult.rows;

    const totalKeysResult = await db.query('SELECT COUNT(*) FROM premium_keys WHERE is_used = false');
    const totalKeys = parseInt(totalKeysResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalKeys / itemsPerPage) || 1;

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Painel de Gestão de Keys')
        .setDescription(`Aqui você pode gerar, revogar e consultar chaves de ativação.\n\n**Chaves Ativas (${totalKeys}):**`)
        .setFooter({ text: `Página ${page} de ${totalPages}` });

    if (keys.length > 0) {
        embed.setDescription(keys.map(key => `\`${key.key_value}\` - ${key.features.join(', ')} (${key.duration_days}d)`).join('\n'));
    } else {
        embed.setDescription('Nenhuma chave ativa encontrada.');
    }

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('dev_key_create').setLabel('Gerar Key Única').setStyle(ButtonStyle.Success).setEmoji('🔑'),
            // --- CORREÇÃO APLICADA AQUI ---
            new ButtonBuilder().setCustomId('dev_open_bulk_keys').setLabel('Gerar Keys em Massa').setStyle(ButtonStyle.Primary).setEmoji('📦'),
            // --- FIM DA CORREÇÃO ---
            new ButtonBuilder().setCustomId('dev_key_revoke').setLabel('Revogar Keys').setStyle(ButtonStyle.Danger).setEmoji('✖️')
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('dev_open_key_stats').setLabel('Estatísticas').setStyle(ButtonStyle.Secondary).setEmoji('📊'),
            new ButtonBuilder().setCustomId('dev_open_key_history').setLabel('Histórico de Ativação').setStyle(ButtonStyle.Secondary).setEmoji('📜')
        );

    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('dev_keys_page_prev').setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 1),
            new ButtonBuilder().setCustomId('dev_keys_page_next').setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page >= totalPages),
            new ButtonBuilder().setCustomId('dev_main_menu_back').setLabel('Voltar ao Menu Principal').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
        );
    
    // Passa o total de páginas para os botões de navegação
    row3.components[0].setCustomId(`dev_keys_page_${page - 1}`);
    row3.components[1].setCustomId(`dev_keys_page_${page + 1}`);


    return { embeds: [embed], components: [row, row2, row3] };
}

module.exports = generateDevKeysMenu;