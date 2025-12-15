const { EmbedBuilder } = require('discord.js');
const MusicOrchestrator = require('../../utils/MusicOrchestrator.js');

module.exports = {
    customId: 'play_select_', // Captura IDs dinâmicos
    async execute(interaction) {
        // Recupera o ID do worker do customId (play_select_WORKERID)
        const workerId = interaction.customId.split('play_select_')[1];
        const url = interaction.values[0];
        
        const memberChannel = interaction.member.voice.channel;
        if (!memberChannel) {
            return interaction.reply({ content: '❌ Você saiu do canal de voz!', ephemeral: true });
        }

        // Recupera o Worker que estava reservado
        const worker = MusicOrchestrator.workers.get(workerId);
        if (!worker) {
            return interaction.reply({ content: '❌ O bot de música designado foi desconectado. Tente novamente.', ephemeral: true });
        }

        await interaction.deferUpdate();

        try {
            // Toca a música selecionada (URL)
            const { track } = await worker.player.play(memberChannel, url, {
                nodeOptions: {
                    metadata: interaction,
                    leaveOnEmpty: true,
                    leaveOnEnd: true,
                    selfDeaf: true
                }
            });

            const embed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setAuthor({ name: `Tocando via ${worker.name}`, iconURL: worker.client.user.displayAvatarURL() })
                .setDescription(`✅ **Selecionado:** [${track.title}](${track.url})`)
                .addFields(
                    { name: 'Duração', value: track.duration, inline: true },
                    { name: 'Autor', value: track.author, inline: true }
                )
                .setFooter({ text: `Selecionado por ${interaction.user.tag}` });

            // Atualiza a mensagem original removendo o menu
            await interaction.editReply({ embeds: [embed], components: [] });

            // Garante liberação do worker ao fim
            const queue = worker.player.nodes.get(interaction.guild.id);
            if (queue) {
                queue.once('empty', () => MusicOrchestrator.releaseWorker(worker.id));
                queue.once('disconnect', () => MusicOrchestrator.releaseWorker(worker.id));
            }

        } catch (error) {
            console.error('[Play Select] Erro:', error);
            MusicOrchestrator.releaseWorker(worker.id);
            await interaction.editReply({ content: '❌ Erro ao carregar a música selecionada.', components: [] });
        }
    }
};