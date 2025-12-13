module.exports = function devUserGuildsResult(targetUser, sharedGuilds) {
    // sharedGuilds é um array de objetos Guild

    const options = sharedGuilds.slice(0, 25).map(g => ({
        label: g.name.substring(0, 100),
        description: `ID: ${g.id} | Membros: ${g.memberCount}`,
        value: g.id,
        emoji: { name: '🏰' }
    }));

    if (options.length === 0) {
        return {
            embeds: [{
                title: '🔍 Resultado da Busca',
                description: `O usuário **${targetUser.tag}** (${targetUser.id}) não foi encontrado em nenhum servidor onde eu estou.`,
                color: 0xE74C3C // Vermelho
            }],
            components: [{
                type: 1,
                components: [{ type: 2, style: 2, label: 'Voltar', custom_id: 'dev_guilds_page_0' }]
            }],
            flags: 1 << 6
        };
    }

    return {
        embeds: [{
            title: `🔍 Guildas de ${targetUser.username}`,
            description: `Encontrei este usuário em **${sharedGuilds.length}** servidores compartilhados.\nSelecione um abaixo para abrir o **Painel de Gerenciamento** daquela guilda.`,
            thumbnail: { url: targetUser.displayAvatarURL() },
            color: 0x5865F2, // Blurple
            fields: [
                { name: 'Usuário', value: `<@${targetUser.id}>\n\`${targetUser.id}\``, inline: true }
            ]
        }],
        components: [
            {
                type: 1,
                components: [{
                    type: 3, // String Select
                    custom_id: 'select_dev_found_guild_manage',
                    options: options,
                    placeholder: 'Selecione a guilda para gerenciar...'
                }]
            },
            {
                type: 1,
                components: [{ type: 2, style: 2, label: 'Voltar', custom_id: 'dev_guilds_page_0' }]
            }
        ],
        flags: 1 << 6
    };
};