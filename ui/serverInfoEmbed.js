const { EmbedBuilder, ChannelType } = require('discord.js');

module.exports = async function generateServerInfoEmbed(guild) {
    const owner = await guild.fetchOwner().catch(() => null);
    
    // Contagens
    const totalMembers = guild.memberCount;
    const bots = guild.members.cache.filter(m => m.user.bot).size; // Nota: Cache precisa estar quente ou usar fetch para precisão total
    const humans = totalMembers - bots;
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const rolesCount = guild.roles.cache.size - 1; // -1 remove @everyone

    const embed = new EmbedBuilder()
        .setColor('#2b2d31')
        .setTitle(guild.name)
        .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
        .setImage(guild.bannerURL({ size: 1024 }))
        .addFields(
            { name: '👑 Dono(a)', value: owner ? `${owner.user.tag} (\`${owner.id}\`)` : 'Desconhecido', inline: false },
            { name: '🆔 ID do Servidor', value: `\`${guild.id}\``, inline: true },
            { name: '📅 Criado em', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:d>`, inline: true },
            { name: '🚀 Boosts', value: `Nível ${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)`, inline: true },
            { name: `👥 Membros (${totalMembers})`, value: `👤 Humanos: **${humans}**\n🤖 Bots: **${bots}**`, inline: true },
            { name: `💬 Canais (${guild.channels.cache.size})`, value: `📝 Texto: **${textChannels}**\n🔊 Voz: **${voiceChannels}**`, inline: true },
            { name: '🛡️ Cargos', value: `**${rolesCount}** cargos configurados`, inline: true }
        )
        .setFooter({ text: `Solicitado por quem ama este servidor ❤️` })
        .setTimestamp();

    return { embeds: [embed] };
};