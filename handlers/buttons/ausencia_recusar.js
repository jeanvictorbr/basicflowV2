// Crie em: handlers/buttons/ausencia_recusar.js
const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'ausencia_recusar',
    async execute(interaction) {
        await interaction.deferUpdate();

        const pending = (await db.query('SELECT * FROM pending_absences WHERE message_id = $1', [interaction.message.id])).rows[0];
        if (!pending) return interaction.editReply({ content: 'Esta solicitação não está mais pendente.', embeds: [], components: [] });
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const member = await interaction.guild.members.fetch(pending.user_id).catch(() => null);

        // Enviar log
        if (settings.ausencias_canal_logs) {
            const logChannel = await interaction.guild.channels.fetch(settings.ausencias_canal_logs);
            const logEmbed = new EmbedBuilder()
                .setColor('Red').setTitle('Ausência Recusada')
                .setAuthor({ name: member?.user.tag || `ID: ${pending.user_id}`, iconURL: member?.user.displayAvatarURL() })
                .addFields(
                    { name: '👤 Membro', value: member ? `${member}` : '`Usuário saiu`' },
                    { name: '👮 Recusado por', value: `${interaction.user}` }
                ).setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
        }

        // Atualizar ficha original
        const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
            .setColor('Red').setTitle('SOLICITAÇÃO RECUSADA')
            .addFields({ name: 'Status', value: `Recusado por ${interaction.user}` });
        await interaction.editReply({ embeds: [updatedEmbed], components: [] });
        
        await db.query('DELETE FROM pending_absences WHERE message_id = $1', [interaction.message.id]);
    }
};