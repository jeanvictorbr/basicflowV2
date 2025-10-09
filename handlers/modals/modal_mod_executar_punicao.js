// Substitua o conteúdo em: handlers/modals/modal_mod_executar_punicao.js
const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;
const ms = require('ms');

module.exports = {
    customId: 'modal_mod_executar_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();

        const [_, __, ___, action, targetId] = interaction.customId.split('_');
        const reason = interaction.fields.getTextInputValue('input_reason');
        
        let durationStr = null;
        let durationMs = null;
        try {
            durationStr = interaction.fields.getTextInputValue('input_duration');
            if (durationStr) {
                // Adiciona 'm' para números puros para facilitar
                if (/^\d+$/.test(String(durationStr))) {
                    durationStr = `${durationStr}m`;
                }
                durationMs = ms(durationStr);
                 if (durationMs === undefined) throw new Error('Invalid duration format');
            }
        } catch (error) {
            // Ignora o erro se o campo 'input_duration' não existir ou se o formato for inválido no modal
        }

        const targetMember = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!targetMember) {
            return interaction.followUp({ content: '❌ O membro alvo não foi encontrado no servidor.', ephemeral: true });
        }

        const settings = (await db.query('SELECT mod_log_channel, mod_temp_ban_enabled FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];

        try {
            const modReason = `Moderador: ${interaction.user.tag} | Motivo: ${reason}`;
            switch (action) {
                case 'warn':
                    await targetMember.send(`⚠️ Você recebeu um aviso no servidor **${interaction.guild.name}**.\n**Motivo:** ${reason}`).catch(()=>{});
                    break;
                case 'timeout':
                    if (!durationMs) {
                        return interaction.followUp({ content: `❌ Formato de duração inválido: \`${durationStr}\`. Use 'm' para minutos, 'h' para horas, 'd' para dias.`, ephemeral: true });
                    }
                    await targetMember.timeout(durationMs, modReason);
                    break;
                case 'kick':
                    await targetMember.kick(modReason);
                    break;
                case 'ban':
                     if (durationStr && !settings.mod_temp_ban_enabled) {
                        return interaction.followUp({ content: '❌ A funcionalidade de banimento temporário é premium e está desativada.', ephemeral: true });
                    }
                    await interaction.guild.bans.create(targetId, { reason: modReason });
                    break;
            }

            await db.query(
                `INSERT INTO moderation_logs (guild_id, user_id, moderator_id, action, reason, duration) VALUES ($1, $2, $3, $4, $5, $6)`,
                [interaction.guild.id, targetId, interaction.user.id, action.toUpperCase(), reason, durationStr]
            );

            if (settings.mod_log_channel) {
                const logChannel = await interaction.guild.channels.fetch(settings.mod_log_channel).catch(() => null);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor(action === 'ban' || action === 'kick' ? 'Red' : 'Orange')
                        .setTitle(`⚖️ Ação de Moderação: ${action.toUpperCase()}`)
                        .addFields(
                            { name: 'Membro Alvo', value: `${targetMember} (\`${targetId}\`)`, inline: true },
                            { name: 'Moderador', value: `${interaction.user} (\`${interaction.user.id}\`)`, inline: true },
                            { name: 'Duração', value: durationStr || 'N/A', inline: true},
                            { name: 'Motivo', value: reason }
                        )
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }

        } catch (error) {
            console.error(`[MODERAÇÃO] Falha ao aplicar ${action}:`, error);
            return interaction.followUp({ content: `❌ Ocorreu um erro ao tentar aplicar a punição. Verifique as minhas permissões, a hierarquia de cargos e a formatação da duração.`, ephemeral: true });
        }
        
        const newHistory = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [targetId, interaction.guild.id])).rows;
        const newNotes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [targetId, interaction.guild.id])).rows;
        
        // CORREÇÃO: Argumentos passados na ordem correta para a função da UI
        const dossiePayload = await generateDossieEmbed(interaction, targetMember, newHistory, newNotes, 0);

        await interaction.editReply({
            ...dossiePayload,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
        
        await interaction.followUp({ content: `✅ Ação **${action.toUpperCase()}** aplicada com sucesso em ${targetMember.user.tag}.`, ephemeral: true });
    }
};