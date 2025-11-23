const { ChannelType } = require('discord.js');

module.exports = function generateVoiceSelectMenu(guild, channels) {
    // 1. Filtragem e Tratamento de Dados
    const voiceChannels = channels
        .filter(c => c.type === ChannelType.GuildVoice) // Apenas canais de voz
        .sort((a, b) => a.position - b.position)      // Ordena pela posição
        .first(24);                                   // CORREÇÃO: Pega apenas 24 para sobrar espaço para o botão "Desconectar"

    // Verifica se encontrou canais
    if (!voiceChannels || voiceChannels.length === 0) {
        return {
            components: [{
                type: 17,
                components: [{ type: 10, content: "❌ Nenhum canal de voz encontrado neste servidor." }]
            }]
        };
    }

    // 2. Mapeamento para Opções do Select
    const options = voiceChannels.map(channel => ({
        label: channel.name.substring(0, 100), 
        value: channel.id,
        description: `Membros conectados: ${channel.members.size}`,
        emoji: { name: "🔊" }
    }));

    // 3. Adiciona opção de desconectar no topo (Totalizando no máximo 25)
    options.unshift({
        label: "Desconectar Bot",
        value: "disconnect",
        description: "Remove o bot de qualquer canal de voz.",
        emoji: { name: "❌" }
    });

    // 4. Retorna o JSON do Componente V2
    return {
        components: [{
            type: 17,
            components: [
                { type: 10, content: "### 🔊 Controle de Presença de Voz" },
                { type: 10, content: "Selecione um canal para o bot entrar e ficar **mutado/ensurdecido**." },
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: "voice_join_channel",
                        options: options,
                        placeholder: "Selecione um canal de voz...",
                        min_values: 1,
                        max_values: 1
                    }]
                }
            ]
        }]
    };
};