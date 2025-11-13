// Caminho: handlers/modals/modal_enviardm_submit.js
const { EmbedBuilder } = require('discord.js');

// Função de pausa para evitar Rate Limit
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    customId: 'modal_enviardm_submit',
    execute: async (interaction, client) => {
        // Adia a resposta, pois isso VAI demorar mais de 3 segundos
        await interaction.deferReply({ ephemeral: true });

        const messageContent = interaction.fields.getTextInputValue('message_input');
        const guild = interaction.guild;

        if (!messageContent || !guild) {
            return interaction.editReply({ content: '❌ Ocorreu um erro ao obter a mensagem ou o servidor.' });
        }

        let members;
        try {
            // Busca TODOS os membros do servidor
            members = await guild.members.fetch();
        } catch (err) {
            console.error("[EnviarDM] Falha ao buscar membros:", err);
            return interaction.editReply({ content: '❌ Falha ao buscar a lista de membros do servidor. Verifique as permissões do bot.' });
        }

        const totalMembers = members.size;
        await interaction.editReply({ 
            content: `📢 **Iniciando Transmissão**\n` +
                     `> Alvo: **${totalMembers}** membros em **${guild.name}**.\n` +
                     `> Estimativa: ${Math.round(totalMembers / 60)} minutos.\n` +
                     `> Status: Enviando... ⏳` 
        });

        let successCount = 0;
        let failCount = 0;
        
        // Converte a Collection para um Array para iterar
        const memberArray = Array.from(members.values());

        for (const member of memberArray) {
            // Pula bots
            if (member.user.bot) {
                continue;
            }

            // Substitui placeholders
            const finalMessage = messageContent
                .replace(/{user.tag}/g, member.user.tag)
                .replace(/{user.mention}/g, `<@${member.id}>`);

            // --- CRIAÇÃO DA EMBED PERSONALIZADA ---
            const dmEmbed = new EmbedBuilder()
                .setColor(interaction.guild.members.me.displayHexColor || '#5865F2') // Usa a cor do bot ou Blurple
                .setAuthor({ 
                    name: `Mensagem de: ${guild.name}`, 
                    iconURL: guild.iconURL({ dynamic: true }) 
                })
                .setThumbnail(guild.iconURL({ dynamic: true })) // Ícone do servidor em destaque
                .setDescription(finalMessage) // A mensagem do admin vai aqui
                .addFields(
                    { name: 'Enviado por', value: `Administração do **${guild.name}**`, inline: true }
                )
                .setFooter({ 
                    text: `Esta é uma mensagem oficial enviada via ${client.user.username}.`, 
                    iconURL: client.user.displayAvatarURL() 
                })
                .setTimestamp();

            try {
                // Envia a Embed em vez de texto puro
                await member.send({ embeds: [dmEmbed] });
                successCount++;
            } catch (error) {
                // Falha comum: O usuário tem DMs desativadas ou bloqueou o bot.
                failCount++;
            }

            // --- PAUSA DE SEGURANÇA CRÍTICA ---
            // Pausa por 1 segundo (1000ms) entre cada DM para evitar Rate Limit
            await delay(1000);
        }

        // Envia o relatório final para o Admin que executou
        const reportEmbed = new EmbedBuilder()
            .setTitle('✅ Transmissão de DM Concluída!')
            .setDescription(`O processo de envio em massa para os membros de **${guild.name}** foi finalizado.`)
            .addFields(
                { name: '📝 Conteúdo Original', value: `\`\`\`${messageContent.substring(0, 1000)}\`\`\`` }, // Limita tamanho para não quebrar embed
                { name: '📊 Estatísticas', value: `✅ **Sucesso:** ${successCount}\n❌ **Falhas (DM Fechada):** ${failCount}\n👥 **Total Tentado:** ${memberArray.length}` }
            )
            .setColor('#2ECC71')
            .setTimestamp();

        await interaction.followUp({
            embeds: [reportEmbed],
            ephemeral: true
        });
    }
};