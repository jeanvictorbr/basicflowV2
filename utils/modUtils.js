// Crie em: utils/modUtils.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const db = require('../database.js');
const ms = require('ms');

async function hasModPermission(interaction) {
    const settings = (await db.query('SELECT mod_roles FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
    const modRoles = settings?.mod_roles?.split(',') || [];
    if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return true;
    return interaction.member.roles.cache.some(role => modRoles.includes(role.id));
}

async function executePunishment(interaction, action, target, reason, durationStr = null) {
    await interaction.deferReply({ ephemeral: true });

    const hasPermission = await hasModPermission(interaction);
    if (!hasPermission) {
        return interaction.editReply({ content: '❌ Você não tem permissão para usar este comando.' });
    }

    const targetMember = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (targetMember && !targetMember.kickable) { // Kickable é uma boa verificação de hierarquia
        return interaction.editReply({ content: '❌ Eu não posso punir este membro. Ele pode ter um cargo superior ao meu ou ao seu.' });
    }

    const settings = (await db.query('SELECT mod_log_channel, mod_temp_ban_enabled FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
    let durationMs = durationStr ? ms(durationStr) : null;

    try {
        switch (action) {
            case 'warn':
                await target.send(`⚠️ Você recebeu um aviso no servidor **${interaction.guild.name}**.\n**Motivo:** ${reason}`);
                break;
            case 'timeout':
                if (!durationMs) throw new Error('Duração inválida para timeout.');
                await targetMember.timeout(durationMs, `Moderador: ${interaction.user.tag} | Motivo: ${reason}`);
                break;
            case 'kick':
                await targetMember.kick(`Moderador: ${interaction.user.tag} | Motivo: ${reason}`);
                break;
            case 'ban':
                if (durationStr && !settings.mod_temp_ban_enabled) {
                    return interaction.editReply({ content: '❌ A funcionalidade de banimento temporário é premium e está desativada.' });
                }
                await interaction.guild.bans.create(target.id, { reason: `Moderador: ${interaction.user.tag} | Motivo: ${reason}`, deleteMessageSeconds: durationMs ? 0 : 604800 });
                break;
        }

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
        await interaction.editReply({ content: `✅ Ação **${action.toUpperCase()}** aplicada com sucesso em ${target.tag}.` });

    } catch (error) {
        console.error(`[MODERAÇÃO] Falha ao aplicar ${action}:`, error);
        return interaction.editReply({ content: `❌ Ocorreu um erro ao aplicar a punição. Verifique as minhas permissões, a hierarquia de cargos e a formatação da duração.` });
    }
}

module.exports = executePunishment;