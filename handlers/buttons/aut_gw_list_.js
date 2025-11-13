// handlers/buttons/aut_gw_list_.js
const db = require('../../database');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_gw_list_',
    async execute(interaction) {
        const gwId = interaction.customId.split('_').pop();
        // Chama a função de paginação para a página 0
        await showPage(interaction, gwId, 0);
    }
};

async function showPage(interaction, gwId, page) {
    const ITEMS_PER_PAGE = 40;
    const offset = page * ITEMS_PER_PAGE;

    // 1. Busca participantes com paginação na TABELA NOVA
    const result = await db.query(`
        SELECT user_id, entry_count 
        FROM automations_giveaway_participants 
        WHERE giveaway_message_id = $1 
        ORDER BY joined_at DESC 
        LIMIT $2 OFFSET $3
    `, [gwId, ITEMS_PER_PAGE, offset]);

    // 2. Conta total de participantes na TABELA NOVA
    const countResult = await db.query("SELECT COUNT(*) FROM automations_giveaway_participants WHERE giveaway_message_id = $1", [gwId]);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Formata a lista
    let desc = result.rows.length > 0 
        ? result.rows.map(p => `• <@${p.user_id}> ${p.entry_count > 1 ? `(${p.entry_count} 🎟️)` : ''}`).join('\n')
        : "Nenhum participante registrado ainda.";

    // Monta o componente V2
    const components = [{
        type: 17,
        components: [
            { type: 10, content: `## 📋 Participantes do Sorteio\nTotal: **${totalCount}**` },
            { type: 10, content: desc },
            { type: 14, divider: true, spacing: 1 }
        ]
    }];

    // Adiciona botões de navegação se houver mais de uma página
    if (totalPages > 1) {
        const row = {
            type: 1,
            components: [
                { type: 2, style: 2, label: "◀", custom_id: `aut_gw_list_pg_${gwId}_${page - 1}`, disabled: page === 0 },
                { type: 2, style: 2, label: `Pág ${page + 1}/${totalPages}`, custom_id: "noop_counter", disabled: true },
                { type: 2, style: 2, label: "▶", custom_id: `aut_gw_list_pg_${gwId}_${page + 1}`, disabled: page >= totalPages - 1 }
            ]
        };
        components[0].components.push(row);
    }

    // Atualiza ou Responde dependendo da origem (botão principal ou botão de página)
    if (interaction.customId.includes('_pg_')) {
        await interaction.update({ components: components, flags: V2_FLAG | EPHEMERAL_FLAG });
    } else {
        await interaction.reply({ components: components, flags: V2_FLAG | EPHEMERAL_FLAG });
    }
}