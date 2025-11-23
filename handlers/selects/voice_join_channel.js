const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'voice_join_channel',
    async execute(interaction) {
        const channelId = interaction.values[0];
        const guild = interaction.guild;

        // Lógica para Desconectar
        if (channelId === 'disconnect') {
            const connection = getVoiceConnection(guild.id);
            if (connection) {
                connection.destroy();
                return interaction.reply({
                    content: '✅ O bot foi desconectado do canal de voz.',
                    flags: EPHEMERAL_FLAG
                });
            } else {
                return interaction.reply({
                    content: '⚠️ O bot não está conectado a nenhum canal.',
                    flags: EPHEMERAL_FLAG
                });
            }
        }

        // Lógica para Conectar
        const channel = await guild.channels.fetch(channelId).catch(() => null);

        if (!channel) {
            return interaction.reply({
                content: '❌ Canal não encontrado ou deletado.',
                flags: EPHEMERAL_FLAG
            });
        }

        try {
            joinVoiceChannel({
                channelId: channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: true, // Ensurdecer (Obrigatório pelo pedido)
                selfMute: true  // Mutar (Obrigatório pelo pedido)
            });

            await interaction.reply({
                content: `✅ **Sucesso!** O bot entrou no canal <#${channel.id}> em modo silencioso (Mutado/Surdo).`,
                flags: EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error('[Voice] Erro ao conectar:', error);
            await interaction.reply({
                content: '❌ Ocorreu um erro ao tentar conectar ao canal de voz.',
                flags: EPHEMERAL_FLAG
            });
        }
    }
};