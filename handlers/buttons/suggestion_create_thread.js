// Substitua o conteúdo em: handlers/buttons/suggestion_create_thread.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'suggestion_create_thread',
    async execute(interaction) {
        await interaction.deferUpdate();

        const suggestionResult = await db.query('SELECT * FROM suggestions WHERE message_id = $1', [interaction.message.id]);
        if (suggestionResult.rows.length === 0) return;
        const suggestion = suggestionResult.rows[0];

        // Se a thread já existe, não faz nada. O botão já é um link.
        if (suggestion.thread_id) return;
        
        try {
            const threadName = `[#${suggestion.id}] Discussão: ${suggestion.title}`.substring(0, 100);
            const thread = await interaction.message.startThread({
                name: threadName,
                autoArchiveDuration: 1440,
                reason: `Discussão para a sugestão #${suggestion.id}`
            });
            
            await thread.send({ content: `💬 <@${interaction.user.id}> iniciou uma discussão sobre a sugestão \`#${suggestion.id}\` de <@${suggestion.user_id}>.` });

            await db.query('UPDATE suggestions SET thread_id = $1 WHERE id = $2', [thread.id, suggestion.id]);

            const discussionButtonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Ver Discussão')
                    .setStyle(ButtonStyle.Link)
                    .setURL(thread.url)
                    .setEmoji('👀')
            );
            
            await interaction.editReply({ components: [interaction.message.components[0], interaction.message.components[1], discussionButtonRow] });

        } catch (error) {
            console.error('Falha ao criar a thread de discussão:', error);
            // Este erro pode acontecer se o usuário clicar duas vezes muito rápido. O followUp ajuda a notificar.
            await interaction.followUp({ content: '❌ Ocorreu um erro ao criar a discussão. Talvez ela já tenha sido criada.', ephemeral: true }).catch(() => {});
        }
    }
};