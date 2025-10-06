const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'ponto_start_service',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!settings?.ponto_status || !settings?.ponto_canal_registros || !settings?.ponto_cargo_em_servico) {
            return interaction.editReply({ content: 'O sistema de bate-ponto está desativado ou mal configurado. Contate um administrador.' });
        }

        const activeSession = (await db.query('SELECT * FROM ponto_sessions WHERE user_id = $1 AND guild_id = $2', [interaction.user.id, interaction.guild.id])).rows[0];
        if (activeSession) {
            return interaction.editReply({ content: 'Você já está em serviço. Bata o ponto de saída para finalizar.' });
        }
        
        const role = await interaction.guild.roles.fetch(settings.ponto_cargo_em_servico).catch(() => null);
        if (!role) {
            return interaction.editReply({ content: 'O cargo "Em Serviço" não foi encontrado. Contate um administrador.' });
        }

        try {
            await interaction.member.roles.add(role);
            
            const logChannel = await interaction.guild.channels.fetch(settings.ponto_canal_registros);
            const startTime = new Date();

            const entryEmbed = new EmbedBuilder()
                .setColor('Green')
                .setAuthor({ name: interaction.member.displayName, iconURL: interaction.user.displayAvatarURL() })
                .setTitle('▶️ Entrada de Serviço')
                .addFields(
                    { name: 'Membro', value: `${interaction.user}`, inline: true },
                    { name: 'Início', value: `<t:${Math.floor(startTime.getTime() / 1000)}:f>`, inline: true }
                )
                .setFooter({ text: `ID do Usuário: ${interaction.user.id}` });

            const logMessage = await logChannel.send({ embeds: [entryEmbed] });

            await db.query(
                'INSERT INTO ponto_sessions (guild_id, user_id, start_time, log_message_id) VALUES ($1, $2, $3, $4)',
                [interaction.guild.id, interaction.user.id, startTime, logMessage.id]
            );

            await interaction.editReply({ content: 'Você entrou em serviço. Bom trabalho!' });
        } catch (error) {
            console.error("Erro ao iniciar serviço:", error);
            await interaction.editReply({ content: 'Ocorreu um erro. Verifique se tenho permissão para gerenciar cargos e enviar mensagens no canal de logs.' });
        }
    }
};