// Em: ui/devPanel/devKeysMenu.js
const db = require('../../database');
const { ButtonStyle } = require('discord.js'); // ButtonStyle (enum) é permitido

/**
 * Gera o menu de chaves V2 (JSON bruto) para o painel de desenvolvedor.
 * @param {object} dbPool O pool de conexão do banco de dados.
 * @param {number} page A página atual.
 * @returns {object} O payload V2 bruto para a resposta da interação.
 */
async function generateDevKeysMenu(dbPool, page = 1) {
    const itemsPerPage = 10;
    const offset = (page - 1) * itemsPerPage;

    // 1. Obter dados do DB
    // (Garantindo que o 'db' correto seja usado, o que é passado do handler)
    const keysResult = await dbPool.query('SELECT * FROM premium_keys WHERE is_used = false ORDER BY id DESC LIMIT $1 OFFSET $2', [itemsPerPage, offset]);
    const keys = keysResult.rows;

    const totalKeysResult = await dbPool.query('SELECT COUNT(*) FROM premium_keys WHERE is_used = false');
    const totalKeys = parseInt(totalKeysResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalKeys / itemsPerPage) || 1;

    // 2. Construir o Embed V2 (type: 17)
    // Este é o JSON que substitui o EmbedBuilder
    const v2Embed = {
        type: 17, // Rich Embed V2
        title: 'Painel de Gestão de Keys',
        description: `Aqui você pode gerar, revogar e consultar chaves de ativação.\n\n**Chaves Ativas (${totalKeys}):**\n\n` +
            (keys.length > 0
                ? keys.map(key => `\`${key.key_value}\` - ${key.features.join(', ')} (${key.duration_days}d)`).join('\n')
                : 'Nenhuma chave ativa encontrada.'
            ),
        color: 0x0099FF, // Cor azul (hex decimal)
        footer: {
            text: `Página ${page} de ${totalPages}`
        }
    };

    // 3. Construir Componentes V2 (JSON bruto)
    // Este é o JSON que substitui o ActionRowBuilder/ButtonBuilder
    const components = [
        // Linha 1: Gerar, Massa, Revogar
        {
            type: 1, // ActionRow
            components: [
                {
                    type: 2, // Button
                    custom_id: 'dev_key_create',
                    label: 'Gerar Key Única',
                    style: ButtonStyle.Success,
                    emoji: { name: '🔑' }
                },
                {
                    type: 2, // Button
                    custom_id: 'dev_open_bulk_keys',
                    label: 'Gerar Keys em Massa',
                    style: ButtonStyle.Primary,
                    emoji: { name: '📦' }
                },
                {
                    type: 2, // Button
                    custom_id: 'dev_key_revoke',
                    label: 'Revogar Keys',
                    style: ButtonStyle.Danger,
                    emoji: { name: '✖️' }
                }
            ]
        },
        // Linha 2: Stats, Histórico
        {
            type: 1, // ActionRow
            components: [
                {
                    type: 2, // Button
                    custom_id: 'dev_open_key_stats',
                    label: 'Estatísticas',
                    style: ButtonStyle.Secondary,
                    emoji: { name: '📊' }
                },
                {
                    type: 2, // Button
                    custom_id: 'dev_open_key_history',
                    label: 'Histórico de Ativação',
                    style: ButtonStyle.Secondary,
                    emoji: { name: '📜' }
                }
            ]
        },
        // Linha 3: Paginação e Voltar
        {
            type: 1, // ActionRow
            components: [
                {
                    type: 2, // Button
                    custom_id: `dev_keys_page_${page - 1}`,
                    label: 'Anterior',
                    style: ButtonStyle.Primary,
                    disabled: page === 1
                },
                {
                    type: 2, // Button
                    custom_id: `dev_keys_page_${page + 1}`,
                    label: 'Próxima',
                    style: ButtonStyle.Primary,
                    disabled: page >= totalPages
                },
                {
                    type: 2, // Button
                    custom_id: 'dev_main_menu_back',
                    label: 'Voltar ao Menu Principal',
                    style: ButtonStyle.Secondary,
                    emoji: { name: '⬅️' }
                }
            ]
        }
    ];

    // 4. Retornar o payload V2 completo
    return {
        content: null,       // Não pode ter 'content'
        embeds: null,        // Não pode ter 'embeds'
        components: components,  // Componentes V2
        v2_embed: v2Embed,       // Embed V2 (type: 17)
    };
}

// Exportação corrigida para 'default' (sem chaves)
module.exports = generateDevKeysMenu;