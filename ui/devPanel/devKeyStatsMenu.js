// Crie em: ui/devPanel/devKeyStatsMenu.js
module.exports = function generateDevKeyStatsMenu(stats = []) {

    const statsList = stats.length > 0
        ? stats.map(group => {
            return `> **Pacote:** \`${group.grants_features}\`\n` +
                   `> ├─ **Quantidade de Chaves:** \`${group.key_count}\`\n` +
                   `> ├─ **Duração:** \`${group.duration_days}\` dias\n` +
                   `> └─ **Usos por Chave:** \`${group.uses_left}\` (Total: \`${group.total_uses_left}\` usos)`;
        }).join('\n\n')
        : '> Nenhuma chave ativa encontrada para gerar estatísticas.';

    const totalKeys = stats.reduce((sum, group) => sum + parseInt(group.key_count, 10), 0);

    return [
        {
            "type": 17, "accent_color": 15844367,
            "components": [
                { "type": 10, "content": "## 📊 Estatísticas de Chaves de Ativação" },
                { "type": 10, "content": `> Análise de todas as **${totalKeys}** chaves ativas no sistema.` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": statsList },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "dev_manage_keys" }
                    ]
                }
            ]
        }
    ];
};