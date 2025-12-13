// ui/devPanel/devUserGuildsResult.js
const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');

module.exports = function devUserGuildsResult(targetUser, sharedGuilds) {
    // 1. Cria as opções do menu (Máximo 25 servidores)
    const options = sharedGuilds.slice(0, 25).map(g => ({
        label: g.name.substring(0, 100),
        description: `ID: ${g.id} | Membros: ${g.memberCount}`,
        value: g.id,
        emoji: '🏰'
    }));

    // 2. Monta o cabeçalho V2
    const headerComponent = {
        type: 10,
        content: `## 🔍 Resultado da Busca: ${targetUser.username}\n` +
                 `> 🆔 **ID:** \`${targetUser.id}\`\n` +
                 `> 📂 **Encontrado em:** ${sharedGuilds.length} servidores compartilhados.` +
                 (sharedGuilds.length > 25 ? `\n> ⚠️ *Exibindo apenas os 25 primeiros.*` : '')
    };

    const components = [];

    if (options.length > 0) {
        // Constrói o menu manualmente para garantir estrutura V2 Type 17
        components.push({
            type: 1, // Action Row
            components: [{
                type: 3, // String Select
                custom_id: 'select_dev_found_guild_manage',
                options: options,
                placeholder: 'Selecione a guilda para gerenciar...'
            }]
        });
    } else {
        headerComponent.content += `\n\n❌ **Nenhuma guilda em comum encontrada.**`;
    }

    // Botão Voltar
    components.push({
        type: 1,
        components: [{ 
            type: 2, // Button
            style: 2, // Secondary
            label: 'Voltar ao Menu', 
            custom_id: 'dev_guilds_page_0' 
        }]
    });

    // RETORNA ARRAY (Essencial para o handler pegar o index 0)
    return [
        {
            type: 17,
            components: [
                headerComponent,
                { type: 14, divider: true, spacing: 2 },
                ...components
            ]
        }
    ];
};