// handlers/modals/modal_send_update.js
const db = require('../../database');

const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_send_update',
    async execute(interaction) {
        await interaction.reply({ content: '🚀 Disparando atualizações para todos os servidores... Isso pode levar alguns minutos.', flags: EPHEMERAL_FLAG });

        const version = interaction.fields.getTextInputValue('update_version');
        const title = interaction.fields.getTextInputValue('update_title');
        const news = interaction.fields.getTextInputValue('update_news');
        const fixes = interaction.fields.getTextInputValue('update_fixes');

        const updateEmbed = {
            "author": { "name": "BasicFlow - Diário de Atualizações", "icon_url": interaction.client.user.displayAvatarURL() },
            "title": `🚀 Nova Atualização: ${title}`,
            "color": 0x3498DB, // Cor padrão do BasicFlow
            "fields": [
                { "name": '✨ Novidades', "value": news }
            ],
            "timestamp": new Date().toISOString(),
            "footer": { "text": `Versão ${version}` }
        };
        
        if(fixes && fixes.trim() !== '') {
            updateEmbed.fields.push({ "name": '🔧 Correções', "value": fixes });
        }

        const result = await db.query('SELECT guild_id, updates_channel_id FROM guild_settings WHERE updates_channel_id IS NOT NULL');
        
        let successCount = 0;
        let failCount = 0;
        const failedGuilds = [];

        for (const row of result.rows) {
            try {
                const channel = await interaction.client.channels.fetch(row.updates_channel_id);
                if (channel) {
                    await channel.send({ embeds: [updateEmbed] });
                    successCount++;
                } else {
                    failCount++;
                    failedGuilds.push(`- Guild ID: \`${row.guild_id}\` (Canal não encontrado)`);
                }
            } catch (error) {
                failCount++;
                failedGuilds.push(`- Guild ID: \`${row.guild_id}\` (Erro: Permissão ou Canal Deletado)`);
                console.error(`Falha ao enviar atualização para Guild ${row.guild_id}:`, error.message);
            }
        }

        await interaction.followUp({ 
            content: `✅ **Envio Concluído!**\n- **Sucessos:** ${successCount}\n- **Falhas:** ${failCount}${failedGuilds.length > 0 ? `\n\n**Detalhes das Falhas:**\n${failedGuilds.slice(0, 10).join('\n')}` : ''}`, 
            flags: EPHEMERAL_FLAG 
        });
    }
};