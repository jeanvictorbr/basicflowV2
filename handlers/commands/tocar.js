const { EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } = require('@discordjs/voice');
const axios = require('axios'); // REQUER: npm install axios
const play = require('play-dl');

// LISTA DE SERVIDORES (Se um cair, tenta o próximo)
const COBALT_INSTANCES = [
    'https://api.cobalt.tools/api/json',      // Oficial (Mais estável)
    'https://cobalt.start.gg/api/json',       // Backup 1
    'https://api.server.cobalt.tools/api/json' // Backup 2
];

module.exports = {
    data: {
        name: 'tocar',
        description: 'Toca música via Multi-Túnel (Anti-Queda)',
        options: [
            {
                name: 'busca',
                type: 3,
                description: 'Nome da música ou Link',
                required: true
            }
        ]
    },
    async execute(interaction) {
        await interaction.deferReply();
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.editReply('❌ Entre em um canal de voz.');

        const query = interaction.options.getString('busca');
        let videoUrl = query;
        let videoTitle = 'Música';
        let videoThumb = null;

        try {
            // --- PASSO 1: ACHAR O LINK (Se for texto) ---
            if (!query.startsWith('http')) {
                // Usa play-dl apenas para achar o link (leitura leve)
                const results = await play.search(query, { limit: 1, source: { youtube: 'video' } });
                
                if (!results || results.length === 0) {
                    return interaction.editReply('❌ Não encontrei nada com esse nome.');
                }
                
                const video = results[0];
                videoUrl = video.url;
                videoTitle = video.title;
                videoThumb = video.thumbnails[0]?.url;
            }

            // --- PASSO 2: O LOOP DA VITÓRIA (Tenta vários servidores) ---
            let streamUrl = null;
            let lastError = '';

            const body = {
                url: videoUrl,
                isAudioOnly: true,
                aFormat: 'mp3'
            };

            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            };

            await interaction.editReply('🔄 **Processando áudio...**');

            // Tenta cada servidor da lista
            for (const apiUrl of COBALT_INSTANCES) {
                try {
                    // console.log(`Tentando baixar via: ${apiUrl}`); // Debug
                    const response = await axios.post(apiUrl, body, { headers, timeout: 10000 });
                    
                    if (response.data && response.data.url) {
                        streamUrl = response.data.url;
                        break; // SUCEEEESSO! Para o loop.
                    }
                } catch (err) {
                    lastError = err.message;
                    continue; // Falhou esse, vai pro próximo
                }
            }

            if (!streamUrl) {
                return interaction.editReply(`❌ **Falha Total:** Tentei 3 servidores diferentes e todos recusaram ou estão fora do ar.\nErro final: ${lastError}`);
            }

            // --- PASSO 3: TOCAR ---
            const resource = createAudioResource(streamUrl);
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
            player.play(resource);
            connection.subscribe(player);

            const embed = new EmbedBuilder()
                .setTitle('🎶 Tocando Agora')
                .setDescription(`**[${videoTitle}](${videoUrl})**`)
                .setFooter({ text: 'Sistema: Multi-Server Bypass' })
                .setColor('Green');

            if (videoThumb) embed.setThumbnail(videoThumb);

            await interaction.editReply({ content: null, embeds: [embed] });

            player.on('error', error => {
                console.error('Erro Player:', error);
                if(!interaction.replied) interaction.followUp({content: 'Erro na reprodução do áudio.', ephemeral:true});
            });

        } catch (error) {
            console.error('Erro Fatal:', error);
            await interaction.editReply(`❌ Erro: ${error.message}`);
        }
    }
};