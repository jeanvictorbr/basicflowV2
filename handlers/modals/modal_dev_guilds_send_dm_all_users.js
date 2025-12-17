// Crie em: handlers/modals/modal_dev_guilds_send_dm_all_users.js
const { EmbedBuilder } = require('discord.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    customId: 'modal_dev_guilds_send_dm_all_users',
    async execute(interaction) {
        await interaction.reply({ 
            content: '⚠️ **Ação de alto risco iniciada.**\nEstou a preparar a lista de todos os membros únicos. O envio começará em breve e pode demorar **várias horas** dependendo do número de usuários. Você será notificado no final.', 
            ephemeral: true 
        });

        const messageContent = interaction.fields.getTextInputValue('input_message_all_users');
        const guilds = Array.from(interaction.client.guilds.cache.values());
        
        let sentCount = 0;
        let failedCount = 0;
        const uniqueUserIds = new Set();

        // 1. Coleta todos os IDs de usuário únicos, ignorando bots
        for (const guild of guilds) {
            try {
                const members = await guild.members.fetch();
                members.forEach(member => {
                    if (!member.user.bot) {
                        uniqueUserIds.add(member.user.id);
                    }
                });
            } catch (err) {
                console.error(`[DEV DM ALL USERS] Falha ao buscar membros da guilda ${guild.name} (${guild.id}):`, err);
            }
        }
        
        const totalUsers = uniqueUserIds.size;
        await interaction.followUp({
            content: `Lista compilada. Encontrei **${totalUsers}** membros únicos para notificar. O envio foi iniciado.`,
            ephemeral: true
        });

        const dmEmbed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle('📢 Mensagem Importante da Equipe BasicFlow')
            .setDescription(messageContent)
            .setFooter({ text: 'Esta é uma mensagem automática enviada pelo desenvolvedor.' })
            .setTimestamp();

        // 2. Envia as mensagens com um intervalo para evitar rate limit
        for (const userId of uniqueUserIds) {
            try {
                const user = await interaction.client.users.fetch(userId);
                await user.send({ embeds: [dmEmbed] });
                sentCount++;
            } catch (error) {
                failedCount++;
            }
            // Pausa de 1 segundo entre cada mensagem
            await delay(1000); 
        }

        // 3. Envia o relatório final da operação
        await interaction.followUp({
            content: `✅ **Envio em massa para todos os membros concluído!**\n\n- **Total de Usuários Únicos:** ${totalUsers}\n- **Sucessos:** ${sentCount}\n- **Falhas (DMs fechadas, etc):** ${failedCount}`,
            ephemeral: true
        });
    }
};