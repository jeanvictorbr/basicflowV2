// Crie em: handlers/modals/modal_dev_guilds_send_dm_all.js
const { EmbedBuilder } = require('discord.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    customId: 'modal_dev_guilds_send_dm_all',
    async execute(interaction) {
        await interaction.reply({ content: 'Iniciando o envio em massa... Isso pode levar vários minutos. Você será notificado no final.', ephemeral: true });

        const messageContent = interaction.fields.getTextInputValue('input_message_all');
        const guilds = Array.from(interaction.client.guilds.cache.values());
        
        let sentCount = 0;
        let failedCount = 0;
        const failedGuilds = [];

        const dmEmbed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle('📢 Mensagem da Equipe BasicFlow')
            .setDescription(messageContent)
            .setFooter({ text: 'Esta é uma mensagem automática enviada pelo desenvolvedor.' })
            .setTimestamp();

        for (const guild of guilds) {
            try {
                const owner = await guild.fetchOwner();
                await owner.send({ embeds: [dmEmbed] });
                sentCount++;
            } catch (error) {
                failedCount++;
                failedGuilds.push(guild.name);
                console.error(`[DEV DM ALL] Falha ao enviar para o dono de ${guild.name}: ${error.message}`);
            }
            // Pausa para evitar limites de taxa da API do Discord
            await delay(1000); 
        }

        await interaction.followUp({
            content: `✅ **Envio em massa concluído!**\n- **Sucessos:** ${sentCount}\n- **Falhas:** ${failedCount}${failedCount > 0 ? `\n- **Servidores com falha:** ${failedGuilds.join(', ')}` : ''}`,
            ephemeral: true
        });
    }
};