const db = require('../../database.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'form_submit_',
    async execute(interaction) {
        const customId = interaction.customId.split('form_submit_')[1];
        
        const form = await db.query('SELECT * FROM forms_templates WHERE guild_id = $1 AND custom_id = $2', [interaction.guild.id, customId]);
        if (form.rows.length === 0) return interaction.reply({ components: [{type:10, content: "Formulário deletado."}], flags: V2_FLAG, ephemeral: true });

        const data = form.rows[0];
        if (!data.log_channel_id) return interaction.reply({ components: [{type:10, content: "Erro de config (Sem log)."}], flags: V2_FLAG, ephemeral: true });

        const logChannel = interaction.guild.channels.cache.get(data.log_channel_id);
        if (!logChannel) return interaction.reply({ components: [{type:10, content: "Canal de logs sumiu."}], flags: V2_FLAG, ephemeral: true });

        // Coleta Respostas
        const fields = [];
        data.questions.forEach((q, index) => {
            const answer = interaction.fields.getTextInputValue(`q_${index}`);
            fields.push({ name: q.label, value: answer ? `\`\`\`${answer}\`\`\`` : '*Em branco*' });
        });

        const embed = new EmbedBuilder()
            .setColor('#F1C40F') // Amarelo (Pendente)
            .setTitle(`📄 Nova Submissão: ${data.title}`)
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`**Usuário:** <@${interaction.user.id}>\n**Status:** ⏳ Pendente`)
            .addFields(fields)
            .setFooter({ text: `ID: ${interaction.user.id}` })
            .setTimestamp();

        // Botões de Ação
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`form_approve_${customId}_${interaction.user.id}`).setLabel('Aprovar').setStyle(ButtonStyle.Success).setEmoji('✅'),
            new ButtonBuilder().setCustomId(`form_reject_${customId}_${interaction.user.id}`).setLabel('Recusar').setStyle(ButtonStyle.Danger).setEmoji('❌')
        );

        await logChannel.send({ content: `Nova resposta de <@${interaction.user.id}>`, embeds: [embed], components: [row] });

        // Resposta V2 sem 'content'
        await interaction.reply({ 
            components: [{ type: 10, content: "✅ **Sucesso!** Suas respostas foram enviadas para análise.", style: 1 }],
            flags: V2_FLAG, 
            ephemeral: true 
        });
    }
};