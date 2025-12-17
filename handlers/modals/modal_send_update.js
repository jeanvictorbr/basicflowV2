// handlers/modals/modal_send_update.js
const db = require('../../database');
const { splitMessage } = require('../../utils/messageSplitter'); // Importa a nova função

const EPHEMERAL_FLAG = 1 << 6;

// Função auxiliar para criar o embed de uma atualização
function createUpdateEmbed(update, client) {
    const embed = {
        "author": { "name": "BasicFlow - Diário de Atualizações", "icon_url": client.user.displayAvatarURL() },
        "title": `🚀 Nova Atualização: ${update.title}`,
        "color": 0x3498DB,
        "fields": [], // Começa com os campos vazios
        "timestamp": new Date(update.created_at || new Date()).toISOString(),
        "footer": { "text": `Versão ${update.version}` }
    };

    // Adiciona o campo de Novidades, dividindo se necessário
    if (update.news && update.news.trim() !== '') {
        const newsChunks = splitMessage(update.news, { maxLength: 1024 });
        newsChunks.forEach((chunk, index) => {
            embed.fields.push({
                name: index === 0 ? '✨ Novidades' : `✨ Novidades (Parte ${index + 1})`,
                value: chunk
            });
        });
    }

    // Adiciona o campo de Correções, dividindo se necessário
    if (update.fixes && update.fixes.trim() !== '') {
        const fixesChunks = splitMessage(update.fixes, { maxLength: 1024 });
        fixesChunks.forEach((chunk, index) => {
            embed.fields.push({
                name: index === 0 ? '🔧 Correções' : `🔧 Correções (Parte ${index + 1})`,
                value: chunk
            });
        });
    }

    return embed;
}


module.exports = {
    customId: 'modal_send_update',
    async execute(interaction) {
        await interaction.reply({ content: '🚀 Registrando e disparando atualizações para todos os servidores... Isso pode levar alguns minutos.', flags: EPHEMERAL_FLAG });

        const version = interaction.fields.getTextInputValue('update_version');
        const title = interaction.fields.getTextInputValue('update_title');
        const news = interaction.fields.getTextInputValue('update_news');
        const fixes = interaction.fields.getTextInputValue('update_fixes');

        try {
            await db.query(
                'INSERT INTO bot_updates (version, title, news, fixes) VALUES ($1, $2, $3, $4)',
                [version, title, news, fixes]
            );
        } catch (error) {
            console.error('[DB Update] Falha ao salvar a nova atualização no banco de dados:', error);
            return interaction.editReply({ content: '❌ Ocorreu um erro ao salvar a atualização no banco de dados. O envio foi cancelado.' });
        }

        const updateEmbed = createUpdateEmbed({ version, title, news, fixes }, interaction.client);

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