// handlers/modals/modal_registro_recusar_motivo.js
const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'modal_registro_recusar_motivo',
    async execute(interaction) {
        await interaction.deferUpdate();
        const motivo = interaction.fields.getTextInputValue('input_motivo_recusa');

        const pending = await db.query('SELECT * FROM pending_registrations WHERE message_id = $1', [interaction.message.id]);
        if (pending.rows.length === 0) {
            return interaction.editReply({ content: 'Esta ficha de registro não está mais pendente.', embeds: [], components: [] });
        }

        const { user_id } = pending.rows[0];
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];

        const member = await interaction.guild.members.fetch(user_id).catch(() => null);
        
        // 1. Enviar DM para o usuário
        if (member) {
            await member.send(`Olá! Sua ficha de registro no servidor **${interaction.guild.name}** foi recusada. \n**Motivo:** ${motivo}`).catch(() => {
                console.log(`Não foi possível enviar DM para ${member.user.tag}`);
            });
        }

        // 2. Enviar log
        if (settings.registros_canal_logs) {
            const logChannel = await interaction.guild.channels.fetch(settings.registros_canal_logs);
            const logEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Registro Recusado')
                .addFields(
                    { name: 'Membro', value: member ? `${member}` : `ID: ${user_id}` },
                    { name: 'Recusado por', value: `${interaction.user}` },
                    { name: 'Motivo', value: motivo }
                )
                .setTimestamp();
            await logChannel.send({ embeds: [logEmbed] });
        }
        
        // 3. Atualizar a ficha original
        const originalEmbed = interaction.message.embeds[0];
        const updatedEmbed = EmbedBuilder.from(originalEmbed)
            .setColor('Red')
            .setTitle('FICHA RECUSADA')
            .addFields(
                { name: 'Recusado por', value: `${interaction.user}` },
                { name: 'Motivo', value: motivo }
            );

        await interaction.editReply({ embeds: [updatedEmbed], components: [] });

        // 4. Salvar no histórico de estatísticas
        await db.query(
            'INSERT INTO registrations_history (guild_id, user_id, moderator_id, status) VALUES ($1, $2, $3, $4)',
            [interaction.guild.id, user_id, interaction.user.id, 'rejected']
        );

        // 5. Deletar o registro pendente
        await db.query('DELETE FROM pending_registrations WHERE message_id = $1', [interaction.message.id]);
    }
};