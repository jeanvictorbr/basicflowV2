// Crie em: handlers/buttons/ausencia_aprovar.js
const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'ausencia_aprovar',
    async execute(interaction) {
        await interaction.deferUpdate();

        const pending = (await db.query('SELECT * FROM pending_absences WHERE message_id = $1', [interaction.message.id])).rows[0];
        if (!pending) return interaction.editReply({ content: 'Esta solicitação não está mais pendente.', embeds: [], components: [] });

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const member = await interaction.guild.members.fetch(pending.user_id).catch(() => null);

        if (!member) {
            await interaction.followUp({ content: 'O membro que fez esta solicitação não está mais no servidor.', ephemeral: true });
        } else {
            // Dar o cargo de ausente
            if (settings.ausencias_cargo_ausente) {
                const role = await interaction.guild.roles.fetch(settings.ausencias_cargo_ausente).catch(() => null);
                if (role) await member.roles.add(role).catch(err => console.error("Erro ao dar cargo de ausente:", err));
            }
        }

        // Enviar log
        if (settings.ausencias_canal_logs) {
            const logChannel = await interaction.guild.channels.fetch(settings.ausencias_canal_logs);
            const logEmbed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Ausência Aprovada')
                .setAuthor({ name: member?.user.tag || `ID: ${pending.user_id}`, iconURL: member?.user.displayAvatarURL() })
                .addFields(
                    { name: '👤 Membro', value: member ? `${member}` : '`Usuário saiu`' },
                    { name: '📅 Período', value: `De \`${pending.start_date}\` até \`${pending.end_date}\`` },
                    { name: '👮 Aprovado por', value: `${interaction.user}` }
                ).setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
        }

        // Atualizar ficha original
        const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
            .setColor('Green').setTitle('SOLICITAÇÃO APROVADA')
            .addFields({ name: 'Status', value: `Aprovado por ${interaction.user}` });
        await interaction.editReply({ embeds: [updatedEmbed], components: [] });

        // Deletar da tabela de pendentes
        await db.query('DELETE FROM pending_absences WHERE message_id = $1', [interaction.message.id]);
    }
};