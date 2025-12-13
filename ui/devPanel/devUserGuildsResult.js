// ui/devPanel/devUserGuildsResult.js
module.exports = function devUserGuildsResult(targetUser, sharedGuilds) {
    // 1. Cria as opções do menu (Máximo 25 servidores)
    const options = sharedGuilds.slice(0, 25).map(g => ({
        label: g.name.substring(0, 100),
        description: `ID: ${g.id} | Membros: ${g.memberCount}`,
        value: g.id,
        emoji: '🏰'
    }));

    // 2. Monta o Embed (Substituindo o Header V2 que causava erro)
    const embed = {
        title: `🔍 Resultado da Busca: ${targetUser.username}`,
        description: `> 🆔 **ID:** \`${targetUser.id}\`\n> 📂 **Encontrado em:** ${sharedGuilds.length} servidores compartilhados.`,
        color: 0x5865F2, // Blurple
        thumbnail: { url: targetUser.displayAvatarURL() }
    };

    if (sharedGuilds.length > 25) {
        embed.footer = { text: '⚠️ Resultado truncado: Exibindo apenas os 25 primeiros.' };
    }

    if (sharedGuilds.length === 0) {
        embed.description += '\n\n❌ **Nenhuma guilda em comum encontrada.**';
        embed.color = 0xE74C3C; // Red
    }

    // 3. Monta os Componentes (Estritamente Type 1: ActionRow)
    const components = [];

    if (options.length > 0) {
        // Row 1: Select Menu
        components.push({
            type: 1, // Action Row
            components: [{
                type: 3, // String Select
                custom_id: 'select_dev_found_guild_manage',
                options: options,
                placeholder: 'Selecione a guilda para gerenciar...'
            }]
        });
    }

    // Row 2: Botão Voltar
    components.push({
        type: 1, // Action Row
        components: [{ 
            type: 2, // Button
            style: 2, // Secondary
            label: 'Voltar ao Menu', 
            custom_id: 'dev_guilds_page_0' 
        }]
    });

    // Retorna o payload padrão de mensagem
    return {
        embeds: [embed],
        components: components
    };
};