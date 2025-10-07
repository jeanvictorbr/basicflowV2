// Crie em: handlers/modals/modal_mod_executar_punicao.js
const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;
const ms = require('ms'); // ms é uma dependência que já temos, usada no Bate-Ponto

module.exports = {
    customId: 'modal_mod_executar_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();

        const [_, __, ___, action, targetId] = interaction.customId.split('_');
        const reason = interaction.fields.getTextInputValue('input_reason');
        const durationStr = interaction.fields.getTextInputValue('input_duration') || null;
        let durationMs = durationStr ? ms(durationStr) : null;

        const targetMember = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!targetMember) {
            return interaction.followUp({ content: '❌ O membro alvo não foi encontrado no servidor.', ephemeral: true });
        }

        const settings = (await db.query('SELECT mod_log_channel FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];

        try {
            // Aplica a punição
            switch (action) {
                case 'warn':
                    await targetMember.send(`⚠️ Você recebeu um aviso no servidor **${interaction.guild.name}**.\n**Motivo:** ${reason}`);
                    break;
                case 'timeout':
                    if (!durationMs) throw new Error('Duração inválida para timeout.');
                    await targetMember.timeout(durationMs, `Moderador: ${interaction.user.tag} | Motivo: ${reason}`);
                    break;
                case 'kick':
                    await targetMember.kick(`Moderador: ${interaction.user.tag} | Motivo: ${reason}`);
                    break;
                case 'ban':
                    await targetMember.ban({ reason: `Moderador: ${interaction.user.tag} | Motivo: ${reason}`, deleteMessageSeconds: durationMs ? 0 : 604800 }); // Apaga 7 dias de msgs em ban permanente
                    break;
            }

            // Regista no banco de dados
            await db.query(
                `INSERT INTO moderation_logs (guild_id, user_id, moderator_id, action, reason, duration) VALUES ($1, $2, $3, $4, $5, $6)`,
                [interaction.guild.id, targetId, interaction.user.id, action.toUpperCase(), reason, durationStr]
            );

            // Envia o log
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
            return interaction.followUp({ content: `❌ Ocorreu um erro ao tentar aplicar a punição. Verifique as minhas permissões e a hierarquia de cargos.`, ephemeral: true });
        }
        
        // Atualiza o Dossiê para refletir a nova punição
        const newHistory = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [targetId, interaction.guild.id])).rows;
        const dossiePayload = generateDossieEmbed(targetMember, newHistory, interaction);

        await interaction.editReply({
            components: dossiePayload.components,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
        
        await interaction.followUp({ content: `✅ Ação **${action.toUpperCase()}** aplicada com sucesso em ${targetMember.user.tag}.`, ephemeral: true });
    }
};