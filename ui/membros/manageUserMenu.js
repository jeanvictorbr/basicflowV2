// File: ui/membros/manageUserMenu.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

function getManageUserMenu(userData, registroData, banData, guildMember, scope, isDev) {
    const userId = userData.user_id;

    const fields = [
        `**Usuário:** <@${userId}> (\`${userId}\`)`,
        `**Usuário Global:** \`${userData.username}\``,
        `**Nível Global:** \`${userData.global_level}\` (XP: ${userData.global_xp})`,
    ];

    let status = '';
    if (banData) {
        status = `🔴 **Banido** (Motivo: ${banData.reason || 'N/D'})`;
    } else if (!guildMember) {
        status = '⚪ **Não está no servidor**';
    } else if (registroData) {
        // A tabela cloudflow_verified_users tem 'verified_at'
        const verifiedTimestamp = Math.floor(parseInt(registroData.verified_at, 10) / 1000);
        status = `🟢 **Verificado** (Verificado em: <t:${verifiedTimestamp}:f>)`;
    } else {
        status = '🟡 **Não Verificado** (Mas está no servidor)';
    }
    fields.push(`**Status na Guilda:** ${status}`);
    
    const description = fields.join('\n');

    // Componentes V2
    const v2_components = [
        { "type": 10, "content": `## 👤 Gerenciando: ${userData.username}` },
        { "type": 10, "content": description },
        { "type": 14, "divider": true, "spacing": 2 },
    ];

    // Botões de Ação (Ban/Unban/Kick)
    v2_components.push({
        type: 1, // Action Row
        components: [
            { type: 2, style: 4, label: 'Banir (Servidor)', custom_id: `membros_user_ban_${scope}_${userId}`, disabled: !!banData },
            { type: 2, style: 3, label: 'Desbanir (Servidor)', custom_id: `membros_user_unban_${scope}_${userId}`, disabled: !banData },
            { type: 2, style: 4, label: 'Remover Verificação', custom_id: `membros_user_kick_${scope}_${userId}`, disabled: !registroData },
        ],
    });

    // --- NOVA ACTION ROW COM BOTÃO DE TRANSFERIR ---
    v2_components.push({
        type: 1, // Action Row
        components: [
            {
                type: 2, // Button
                style: 1, // Primary
                label: 'Transferir Usuário',
                emoji: { name: '🚀' },
                custom_id: `membros_transfer_user_${scope}_${userId}`,
                disabled: !registroData || scope !== 'GUILD' // Só pode transferir se verificado e na visão de Guilda
            }
        ]
    });
    
    // Voltar
    v2_components.push({
        type: 1, // Action Row
        components: [
            { type: 2, style: 2, label: 'Voltar para a Lista', custom_id: `membros_user_back_to_list_${scope}` },
        ],
    });

    return {
        type: 17,
        flags: V2_FLAG | EPHEMERAL_FLAG,
        accent_color: 0x5865F2, // Blurple
        components: v2_components
    };
}

module.exports = { getManageUserMenu };