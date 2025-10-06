// handlers/buttons/ticket_close.js
const { AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');

async function requestFeedback(interaction, ticket, opener) {
    if (!opener) return;

    try {
        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle('Avalie nosso Atendimento')
            .setDescription(`Olá! Parece que seu ticket \`#${String(ticket.ticket_number).padStart(4, '0')}\` no servidor **${interaction.guild.name}** foi finalizado.\n\nPor favor, dedique um momento para avaliar o suporte que você recebeu. Sua opinião é muito importante para nós!`);

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`feedback_star_1_${ticket.channel_id}`).setLabel('1').setStyle(ButtonStyle.Secondary).setEmoji('⭐'),
            new ButtonBuilder().setCustomId(`feedback_star_2_${ticket.channel_id}`).setLabel('2').setStyle(ButtonStyle.Secondary).setEmoji('⭐'),
            new ButtonBuilder().setCustomId(`feedback_star_3_${ticket.channel_id}`).setLabel('3').setStyle(ButtonStyle.Secondary).setEmoji('⭐'),
            new ButtonBuilder().setCustomId(`feedback_star_4_${ticket.channel_id}`).setLabel('4').setStyle(ButtonStyle.Secondary).setEmoji('⭐'),
            new ButtonBuilder().setCustomId(`feedback_star_5_${ticket.channel_id}`).setLabel('5').setStyle(ButtonStyle.Success).setEmoji('⭐')
        );

        await opener.send({ embeds: [embed], components: [buttons] });
    } catch (error) {
        console.log(`[Feedback] Não foi possível enviar DM de avaliação para ${opener.user.tag}.`);
    }
}


module.exports = {
    customId: 'ticket_close',
    async execute(interaction) {
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        
        // Verifica se quem está fechando é o próprio usuário ou um admin
        const isSupport = interaction.member.roles.cache.has(settings.tickets_cargo_suporte);
        const ticketInfo = (await db.query('SELECT user_id FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const isOwner = interaction.user.id === ticketInfo.user_id;

        if (!isSupport && !isOwner) {
            return interaction.reply({ content: 'Você não tem permissão para fechar este ticket.', ephemeral: true });
        }

        await interaction.deferUpdate();
        const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        if (!ticket || ticket.status === 'closed') return;

        const opener = await interaction.guild.members.fetch(ticket.user_id).catch(() => null);

        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcriptText = messages.reverse().map(m => `[${new Date(m.createdTimestamp).toLocaleString('pt-BR')}] ${m.author.tag} (<@${m.author.id}>): ${m.content}`).join('\n');
        const transcriptFile = new AttachmentBuilder(Buffer.from(transcriptText), { name: `transcript-${interaction.channel.name}.txt` });
        
        if (settings.tickets_canal_logs) {
            const logChannel = await interaction.guild.channels.fetch(settings.tickets_canal_logs);
            const finalActionLog = ticket.action_log + `> Ticket finalizado por <@${interaction.user.id}>.\n`;

            const logEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('📄 Transcrição de Ticket Finalizado')
                .setAuthor({ name: opener?.user.tag || `ID: ${ticket.user_id}`, iconURL: opener?.user.displayAvatarURL() })
                .setThumbnail(opener?.user.displayAvatarURL() || null)
                .addFields(
                    { name: 'Ticket ID', value: `\`#${String(ticket.ticket_number).padStart(4, '0')}\``, inline: true },
                    { name: 'Aberto por', value: opener ? `${opener}` : '`Usuário saiu`', inline: true },
                    { name: 'Fechado por', value: `${interaction.user}`, inline: true },
                    { name: 'Histórico de Ações', value: finalActionLog.substring(0, 1024) }
                )
                .setFooter({ text: `ID do Canal: ${interaction.channel.id}`})
                .setTimestamp();
            await logChannel.send({ embeds: [logEmbed], files: [transcriptFile] });
        }
        
        await db.query(`UPDATE tickets SET status = 'closed', claimed_by = $1, closed_at = NOW() WHERE channel_id = $2`, [interaction.user.id, interaction.channel.id]);
        
        // ENVIO DO FEEDBACK
        if (settings.tickets_feedback_enabled) {
            await requestFeedback(interaction, ticket, opener);
        }

        await interaction.channel.send({ content: 'Este ticket foi finalizado e será deletado em 10 segundos.' });
        setTimeout(async () => {
            await interaction.channel.delete().catch(err => console.error("Não foi possível deletar o canal do ticket:", err));
        }, 10000);
    }
};