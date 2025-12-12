module.exports = {
    customId: 'voice_mute_select_',
    async execute(interaction) {
        const channelId = interaction.customId.split('_').pop();
        const targetUserId = interaction.values[0];
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel) return interaction.update({ content: "Sala não existe mais.", components: [] });

        const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);

        if (member && member.voice.channelId === channelId) {
            // Verifica se o usuário já está mutado para inverter (Toggle)
            const isMuted = member.voice.serverMute;
            
            try {
                await member.voice.setMute(!isMuted);
                await interaction.update({ 
                    content: `✅ **${member.user.username}** foi ${!isMuted ? '🔇 MUTADO' : '🔊 DESMUTADO'} com sucesso.`, 
                    components: [] 
                });
            } catch (err) {
                await interaction.update({ content: "❌ Erro: Não tenho permissão para mutar este usuário (talvez ele seja admin).", components: [] });
            }
        } else {
            await interaction.update({ content: "❌ Esse usuário não está conectado na sua sala.", components: [] });
        }
    }
};