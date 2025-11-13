const db = require('../database');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// --- COMPONENTES VISUAIS ---
async function getGiveawayComponents(giveawayData, client) {
    const countResult = await db.query('SELECT COUNT(*) FROM automations_giveaway_participants WHERE giveaway_message_id = $1', [giveawayData.message_id]);
    const participantCount = parseInt(countResult.rows[0].count) || 0;

    // Define cor e texto baseado no status
    let color = '#2B2D31'; // Active (Cinza escuro/Padrão)
    let timeText = `<t:${Math.floor(giveawayData.end_timestamp / 1000)}:R> (<t:${Math.floor(giveawayData.end_timestamp / 1000)}:f>)`;
    
    if (giveawayData.status === 'ended') {
        color = '#FFD700'; // Gold
        timeText = '🔴 Encerrado';
    } else if (giveawayData.status === 'cancelled') {
        color = '#ED4245'; // Red
        timeText = '🚫 Cancelado';
    }

    const embed = new EmbedBuilder()
        .setTitle(`🎉 ${giveawayData.prize}`)
        .setDescription(giveawayData.description || 'Participe clicando no botão abaixo!')
        .setColor(color)
        .addFields(
            { name: '🏆 Vencedores', value: `${giveawayData.winner_count}`, inline: true },
            { name: '👥 Participantes', value: `${participantCount}`, inline: true },
            { name: '⏰ Termina em', value: timeText, inline: false }
        )
        .setFooter({ text: `Sorteio ID: ${giveawayData.message_id}` })
        .setTimestamp();

    if (giveawayData.required_roles && giveawayData.required_roles.length > 0) {
        const roles = giveawayData.required_roles.map(r => `<@&${r}>`).join(', ');
        embed.addFields({ name: '🔒 Requisitos', value: `Cargos: ${roles}`, inline: false });
    }

    if (giveawayData.bonus_roles && Object.keys(giveawayData.bonus_roles).length > 0) {
        embed.addFields({ name: '✨ Bônus', value: 'Existem cargos com chances extras!', inline: false });
    }

    const components = [];

    if (giveawayData.status === 'active') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`aut_gw_join_${giveawayData.message_id}`).setLabel('Participar 🎉').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`aut_gw_leave_${giveawayData.message_id}`).setLabel('Sair 🚪').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`aut_gw_list_${giveawayData.message_id}`).setLabel(`Lista (${participantCount})`).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`aut_gw_manage_${giveawayData.message_id}`).setEmoji('⚙️').setStyle(ButtonStyle.Secondary)
        );
        components.push(row);
    } else {
        // Se encerrado ou cancelado, mantém botões de leitura/admin
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`aut_gw_list_${giveawayData.message_id}`).setLabel(`Ver Participantes (${participantCount})`).setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`aut_gw_manage_${giveawayData.message_id}`).setEmoji('⚙️').setStyle(ButtonStyle.Secondary)
        );
        components.push(row);
    }

    return { embeds: [embed], components: components };
}

// --- LÓGICA DO SORTEIO ---
async function pickWinners(giveawayId) {
    const parts = await db.query('SELECT user_id, entry_count FROM automations_giveaway_participants WHERE giveaway_message_id = $1', [giveawayId]);
    if (parts.rows.length === 0) return [];

    let pool = [];
    parts.rows.forEach(p => {
        for (let i = 0; i < p.entry_count; i++) pool.push(p.user_id);
    });

    pool = pool.sort(() => Math.random() - 0.5);

    const settings = (await db.query('SELECT winner_count FROM automations_giveaways WHERE message_id = $1', [giveawayId])).rows[0];
    const winnerCount = settings ? settings.winner_count : 1;
    
    const winners = [...new Set(pool)].slice(0, winnerCount);
    return winners;
}

// --- LÓGICA DE ENCERRAMENTO ---
// Adicionado parâmetro: isCancelled
async function endGiveaway(client, messageId, reroll = false, endedBy = null, isCancelled = false) {
    const gw = (await db.query("SELECT * FROM automations_giveaways WHERE message_id = $1", [messageId])).rows[0];
    if (!gw) return;

    // Atualiza Status no DB
    if (!reroll) {
        const newStatus = isCancelled ? 'cancelled' : 'ended';
        await db.query("UPDATE automations_giveaways SET status = $1 WHERE message_id = $2", [newStatus, messageId]);
    }

    let winners = [];
    let winnerString = 'Nenhum participante.';

    // Se NÃO for cancelado, sorteia
    if (!isCancelled) {
        winners = await pickWinners(messageId);
        winnerString = winners.length > 0 ? winners.map(w => `<@${w}>`).join(', ') : 'Nenhum participante.';
    } else {
        winnerString = "🚫 **Sorteio Cancelado** (Nenhum vencedor selecionado)";
    }

    try {
        const channel = await client.channels.fetch(gw.channel_id);
        const message = await channel.messages.fetch(messageId);
        
        // Atualiza a Embed Pública
        const embed = new EmbedBuilder(message.embeds[0].data);
        
        if (isCancelled) {
            embed.setColor('#ED4245'); // Vermelho
            embed.setTitle(`🚫 SORTEIO CANCELADO: ${gw.prize}`);
        } else {
            embed.setColor(reroll ? '#3498DB' : '#FFD700'); 
            embed.setTitle(reroll ? `🔄 SORTEIO REFEITO: ${gw.prize}` : `🎉 SORTEIO ENCERRADO: ${gw.prize}`);
        }
        
        // Limpa campos antigos
        const cleanFields = embed.data.fields.filter(f => !f.name.includes('Status') && !f.name.includes('Vencedores'));
        embed.setFields(cleanFields);

        // Descrição do resultado
        if (isCancelled) {
            embed.setDescription(`**Status:** Cancelado\n**Motivo:** Encerrado manualmente pelo administrador.\n\n${gw.description || ''}`);
        } else {
            embed.setDescription(`**Vencedores:** ${winnerString}\n\n${gw.description || ''}`);
        }

        embed.addFields({ name: '🔴 Status', value: isCancelled ? `🚫 Cancelado <t:${Math.floor(Date.now()/1000)}:R>` : `Encerrado <t:${Math.floor(Date.now()/1000)}:R>`, inline: false });

        // Renderiza
        // Nota: Passamos o status manualmente para a função de componentes gerar a cor correta
        const statusForComponent = isCancelled ? 'cancelled' : 'ended';
        const payload = await getGiveawayComponents({ ...gw, status: statusForComponent }, client);
        await message.edit({ embeds: [embed], components: payload.components });
        
        // Mensagens no Chat
        if (!isCancelled) {
            if (winners.length > 0) {
                await channel.send({ 
                    content: reroll 
                        ? `🔄 **REROLL!** Os novos vencedores de **${gw.prize}** são: ${winnerString}! Parabéns!`
                        : `🎉 **PARABÉNS!** Os vencedores de **${gw.prize}** são: ${winnerString}! 🥳`,
                    reply: { messageReference: messageId }
                });

                // DM
                for (const userId of winners) {
                    try {
                        const user = await client.users.fetch(userId);
                        await user.send(`🎉 **Parabéns!** Você ganhou **${gw.prize}** no servidor **${message.guild.name}**! \nAbra um ticket ou contate a staff para resgatar.`);
                    } catch (dmErr) {}
                }
            } else {
                await channel.send(`🥀 O sorteio de **${gw.prize}** encerrou sem participantes.`);
            }
        } else {
            await channel.send(`🚫 O sorteio de **${gw.prize}** foi cancelado pela administração.`);
        }

        // Logs
        const settings = (await db.query("SELECT giveaway_log_channel_id, mod_log_channel FROM guild_settings WHERE guild_id = $1", [gw.guild_id])).rows[0];
        const logChannelId = settings ? (settings.giveaway_log_channel_id || settings.mod_log_channel) : null;

        if (logChannelId) {
            const logChannel = await client.channels.fetch(logChannelId).catch(() => null);
            if (logChannel) {
                const logTitle = isCancelled 
                    ? '🚫 Log de Sorteio (Cancelado)' 
                    : (reroll ? '🔄 Log de Sorteio (Reroll)' : '🎉 Log de Sorteio (Finalizado)');
                
                const logColor = isCancelled ? '#ED4245' : '#F1C40F';

                const logEmbed = new EmbedBuilder()
                    .setTitle(logTitle)
                    .setColor(logColor)
                    .addFields(
                        { name: '🎁 Prêmio', value: gw.prize, inline: true },
                        { name: '🏆 Resultado', value: winnerString, inline: true },
                        { name: '📅 Criado por', value: `<@${gw.host_id}>`, inline: true },
                        { name: '🛑 Ação por', value: endedBy ? `${endedBy}` : '🤖 Sistema', inline: true },
                        { name: '🔗 Link', value: `[Ir para Mensagem](${message.url})`, inline: false }
                    )
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }
        }

    } catch (e) {
        console.error(`[Giveaway End] Falha ao encerrar/cancelar sorteio ${messageId}:`, e);
    }
}

// --- MONITOR ---
async function startGiveawayMonitor(client) {
    setInterval(async () => {
        try {
            const expired = await db.query("SELECT * FROM automations_giveaways WHERE status = 'active' AND end_timestamp <= $1", [Date.now()]);
            for (const gw of expired.rows) {
                await endGiveaway(client, gw.message_id);
            }
        } catch (e) {
            console.error('[Giveaway Monitor] Erro:', e);
        }
    }, 60 * 1000);
}

module.exports = { getGiveawayComponents, startGiveawayMonitor, endGiveaway, pickWinners };