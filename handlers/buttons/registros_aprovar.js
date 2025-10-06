// handlers/buttons/registros_aprovar.js
const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'registros_aprovar',
    async execute(interaction) {
        await interaction.deferUpdate();

        const pending = await db.query('SELECT * FROM pending_registrations WHERE message_id = $1', [interaction.message.id]);
        if (pending.rows.length === 0) {
            return interaction.editReply({ content: 'Esta ficha de registro não está mais pendente.', embeds: [], components: [] });
        }

        const { user_id, nome_rp, id_rp } = pending.rows[0];
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];

        const member = await interaction.guild.members.fetch(user_id).catch(() => null);
        if (!member) {
            return interaction.followUp({ content: 'O membro que solicitou este registro não está mais no servidor.', ephemeral: true });
        }

        try {
            // 1. Dar o cargo
            if (settings.registros_cargo_aprovado) {
                const role = await interaction.guild.roles.fetch(settings.registros_cargo_aprovado);
                if (role) await member.roles.add(role);
            }

            // 2. Mudar o nickname
            const newNickname = `${settings.registros_tag_aprovado || ''} ${nome_rp} | ${id_rp}`.trim();
            await member.setNickname(newNickname);

            // 3. Enviar log
            if (settings.registros_canal_logs) {
                const logChannel = await interaction.guild.channels.fetch(settings.registros_canal_logs);
                const logEmbed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('Registro Aprovado')
                    .addFields(
                        { name: 'Membro', value: `${member}` },
                        { name: 'Novo Nickname', value: newNickname },
                        { name: 'Aprovado por', value: `${interaction.user}` }
                    )
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }

            // 4. Atualizar a ficha original
            const originalEmbed = interaction.message.embeds[0];
            const updatedEmbed = EmbedBuilder.from(originalEmbed)
                .setColor('Green')
                .setTitle('FICHA APROVADA')
                .addFields({ name: 'Aprovado por', value: `${interaction.user}` });

            await interaction.editReply({ embeds: [updatedEmbed], components: [] });

            // 5. Salvar no histórico de estatísticas
            await db.query(
                'INSERT INTO registrations_history (guild_id, user_id, moderator_id, status) VALUES ($1, $2, $3, $4)',
                [interaction.guild.id, user_id, interaction.user.id, 'approved']
            );

            // 6. Deletar o registro pendente
            await db.query('DELETE FROM pending_registrations WHERE message_id = $1', [interaction.message.id]);

        } catch (error) {
            console.error("Erro ao aprovar registro:", error);
            await interaction.followUp({ content: 'Ocorreu um erro ao aprovar o registro. Verifique minhas permissões (Gerenciar Cargos, Gerenciar Apelidos).', ephemeral: true });
        }
    }
};