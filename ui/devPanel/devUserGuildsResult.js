// ui/devPanel/devUserGuildsResult.js
module.exports = function devUserGuildsResult(targetUser, sharedGuilds) {
    // 1. Gera as opções do Select Menu
    const options = sharedGuilds.slice(0, 25).map(g => ({
        label: g.name.substring(0, 100),
        description: `ID: ${g.id} | Membros: ${g.memberCount}`,
        value: g.id,
        emoji: { name: '🏰' }
    }));

    // Cabeçalho V2 (Type 10)
    const headerComponent = {
        type: 10,
        content: `## 🔍 Resultado da Busca: ${targetUser.username}\n` +
                 `> 🆔 **ID:** \`${targetUser.id}\`\n` +
                 `> 📂 **Encontrado em:** ${sharedGuilds.length} servidores compartilhados.`
    };

    const components = [];

    if (options.length > 0) {
        // Menu de Seleção V2
        components.push({
            type: 1,
            components: [{
                type: 3, // String Select
                custom_id: 'select_dev_found_guild_manage',
                options: options,
                placeholder: 'Selecione a guilda para gerenciar...'
            }]
        });
    } else {
        // Mensagem se não achar nada
        headerComponent.content += `\n\n❌ **Nenhuma guilda em comum encontrada.**`;
    }

    // Botão Voltar
    components.push({
        type: 1,
        components: [{ type: 2, style: 2, label: 'Voltar ao Menu', custom_id: 'dev_guilds_page_0' }]
    });

    // Retorna Array V2 (Importante para compatibilidade)
    return [
        {
            type: 17,
            components: [
                headerComponent,
                { type: 14, divider: true, spacing: 2 }, // Divisor
                ...components
            ]
        }
    ];
};