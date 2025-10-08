// Substitua o conteúdo em: utils/modUtils.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const db = require('../database.js');
const ms = require('ms');

async function hasModPermission(interaction) {
    const settings = (await db.query('SELECT mod_roles FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
    const modRoles = settings?.mod_roles?.split(',') || [];
    if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
    return interaction.member.roles.cache.some(role => modRoles.includes(role.id));
}

async function executePunishment(interaction, action, target, reason, durationStr = null, customPunishment = null) {
    const isFakeInteraction = !interaction.editReply;

    if (!isFakeInteraction) {
        await interaction.deferReply({ ephemeral: true });
    }

    const hasPermission = await hasModPermission(interaction);
    if (!hasPermission) {
        const reply = { content: '❌ Você não tem permissão para usar este comando.' };
        return isFakeInteraction ? console.log(reply.content) : interaction.editReply(reply);
    }

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (action !== 'ban' && !targetMember) {
        const reply = { content: `❌ O membro alvo não foi encontrado no servidor.` };
        return isFakeInteraction ? console.log(reply.content) : interaction.editReply(reply);
    }
    
    if (targetMember && action !== 'warn' && !targetMember.kickable) {
        const reply = { content: '❌ Eu não posso punir este membro. Ele pode ter um cargo superior ao meu.' };
        return isFakeInteraction ? console.log(reply.content) : interaction.editReply(reply);
    }

    const settings = (await db.query('SELECT mod_log_channel, mod_temp_ban_enabled FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
    let durationMs = null;
    
    if (durationStr) {
        if (/^\d+$/.test(String(durationStr))) {
            durationStr = `${durationStr}m`;
        }
        try {
            durationMs = ms(durationStr);
            if (durationMs === undefined) throw new Error('Invalid duration format');
        } catch (e) {
            const reply = { content: `❌ Formato de duração inválido: \`${durationStr}\`. Use 'm' para minutos, 'h' para horas, 'd' para dias.` };
            return isFakeInteraction ? console.log(reply.content) : interaction.editReply(reply);
        }
    }

    try {
        const modReason = `Moderador: ${interaction.user.tag} | Motivo: ${reason}`;
        switch (action) {
            case 'warn':
                if (targetMember) await targetMember.send(`⚠️ Você recebeu um aviso no servidor **${interaction.guild.name}**.\n**Motivo:** ${reason}`).catch(()=>{});
                break;
            case 'timeout':
                if (!durationMs) throw new Error('Duração inválida ou não fornecida para timeout.');
                await targetMember.timeout(durationMs, modReason);
                break;
            case 'kick':
                await targetMember.kick(modReason);
                break;
            case 'ban':
                 if (durationStr && !settings.mod_temp_ban_enabled) {
                    const reply = { content: '❌ A funcionalidade de banimento temporário é premium e está desativada.' };
                    return isFakeInteraction ? console.log(reply.content) : interaction.editReply(reply);
                }
                await interaction.guild.bans.create(target.id, { reason: modReason });
                break;
        }

        // --- LÓGICA PARA ADICIONAR O CARGO ---
        if (targetMember && customPunishment && customPunishment.role_id) {
            try {
                const role = await interaction.guild.roles.fetch(customPunishment.role_id);
                if (role) {
                    await targetMember.roles.add(role, `Punição: ${customPunishment.name}`);
                }
            } catch (roleError) {
                console.error(`[MOD UTILS] Falha ao adicionar o cargo ${customPunishment.role_id}:`, roleError);
                if (settings.mod_log_channel) {
                    const logChannel = await interaction.guild.channels.fetch(settings.mod_log_channel).catch(() => null);
                    if (logChannel) {
                        await logChannel.send(`⚠️ **Alerta:** Falha ao adicionar o cargo da punição \`${customPunishment.name}\` ao membro ${target}. Verifique se o cargo <@&${customPunishment.role_id}> ainda existe e se eu tenho permissão para gerenciá-lo.`);
                    }
                }
            }
        }
        // --- FIM DA LÓGICA DO CARGO ---

        await db.query(
            `INSERT INTO moderation_logs (guild_id, user_id, moderator_id, action, reason, duration) VALUES ($1, $2, $3, $4, $5, $6)`,
            [interaction.guild.id, target.id, interaction.user.id, action.toUpperCase(), reason, durationStr]
        );

        if (settings.mod_log_channel) {
            const logChannel = await interaction.guild.channels.fetch(settings.mod_log_channel).catch(() => null);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor(action === 'ban' || action === 'kick' ? 'Red' : 'Orange')
                    .setTitle(`⚖️ Ação de Moderação: ${action.toUpperCase()}`)
                    .addFields(
                        { name: 'Membro Alvo', value: `${target} (\`${target.id}\`)`, inline: true },
                        { name: 'Moderador', value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                        { name: 'Duração', value: durationStr || 'N/A', inline: true},
                        { name: 'Motivo', value: reason }
                    )
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }
        }
        
        if (!isFakeInteraction) {
            await interaction.editReply({ content: `✅ Ação **${action.toUpperCase()}** aplicada com sucesso em ${target.tag}.` });
        }

    } catch (error) {
        console.error(`[MODERAÇÃO] Falha ao aplicar ${action}:`, error);
        const reply = { content: `❌ Ocorreu um erro ao aplicar a punição. Verifique as minhas permissões, a hierarquia de cargos e a formatação da duração.` };
        return isFakeInteraction ? console.log(reply.content) : interaction.editReply(reply);
    }
}

module.exports = executePunishment;