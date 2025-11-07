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
            content: `Iniciando o envio para **${totalMembers}** membros.\n` +
                     `Isso pode demorar muito (aprox. ${Math.round(totalMembers / 60)} minutos).\n` +
                     `Você será notificado aqui quando o processo for concluído.` 
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

            try {
                await member.send(finalMessage);
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
            .setTitle('✅ Envio em Massa Concluído!')
            .setDescription(`Um relatório do envio de DMs em massa foi gerado.`)
            .addFields(
                { name: 'Mensagem Enviada', value: `>>> ${messageContent}` },
                { name: '📤 Sucessos', value: `\`${successCount}\` membros receberam a DM.`, inline: true },
                { name: '🚫 Falhas', value: `\`${failCount}\` membros não puderam ser contatados (DMs fechadas).`, inline: true }
            )
            .setColor('#2ECC71')
            .setFooter({ text: `Servidor: ${guild.name}` })
            .setTimestamp();

        await interaction.followUp({
            embeds: [reportEmbed],
            ephemeral: true
        });
    }
};