// Crie em: handlers/modals/modal_mod_executar_punicao.js
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

        // --- CORREÇÃO APLICADA AQUI ---
        // Só tenta ler a duração se o campo puder existir
        let durationStr = null;
        let durationMs = null;
        if (action === 'timeout' || action === 'ban') {
            // Usamos .getField para evitar o erro se o campo não existir (ex: ban permanente)
            durationStr = interaction.fields.getField('input_duration', false)?.value || null;
            if (durationStr) {
                durationMs = ms(durationStr);
            }
        }
        // --- FIM DA CORREÇÃO ---

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
                    if (!durationMs) throw new Error('Duração inválida ou não fornecida para timeout.');
                    await targetMember.timeout(durationMs, `Moderador: ${interaction.user.tag} | Motivo: ${reason}`);
                    break;
                case 'kick':
                    await targetMember.kick(`Moderador: ${interaction.user.tag} | Motivo: ${reason}`);
                    break;
                case 'ban':
                    await interaction.guild.bans.create(targetId, { reason: `Moderador: ${interaction.user.tag} | Motivo: ${reason}` });
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