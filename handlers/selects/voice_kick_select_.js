module.exports = {
    customId: 'voice_kick_select_',
    async execute(interaction) {
        const channelId = interaction.customId.split('_').pop();
        const targetUserId = interaction.values[0];
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel) return interaction.update({ content: "Sala não existe mais.", components: [] });

        const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);

        if (member && member.voice.channelId === channelId) {
            await member.voice.disconnect(`Expulso pelo dono da sala`);
            await interaction.update({ content: `👋 **${member.user.username}** foi removido da sala.`, components: [] });
        } else {
            await interaction.update({ content: "❌ Esse usuário não está na sua sala.", components: [] });
        }
    }
};