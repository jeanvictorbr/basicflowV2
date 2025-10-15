// Crie/Substitua o conteúdo em: handlers/buttons/ticket_dm_staff_close.js
const ticketCloseHandler = require('./ticket_close.js');
const db = require('../../database.js');

module.exports = {
    customId: 'ticket_dm_staff_close_',
    async execute(interaction) {
        // A interação acontece na THREAD, então o ID do ticket está no PARENT ID.
        const ticketAnchorChannelId = interaction.channel.parentId;

        if (!interaction.guild) {
            return interaction.reply({ content: 'Erro: Guild não encontrada.', ephemeral: true });
        }
        
        // Busca o canal âncora do ticket
        const anchorChannel = await interaction.guild.channels.fetch(ticketAnchorChannelId).catch(() => null);
        if (!anchorChannel) {
            // Se o canal âncora foi deletado, tenta fechar o ticket pelo DB e avisa o admin.
            await interaction.deferReply({ ephemeral: true });
            await db.query("UPDATE tickets SET status = 'closed' WHERE thread_id = $1", [interaction.channel.id]);
            await interaction.editReply('⚠️ O canal principal do ticket não foi encontrado, mas o ticket foi marcado como fechado no sistema. A thread pode ser arquivada ou deletada manualmente.');
            return;
        }

        // Simula a interação como se tivesse ocorrido no canal âncora.
        // Isso permite que o handler de fechamento universal funcione perfeitamente.
        interaction.channel = anchorChannel;

        // Chama o handler principal que já contém toda a lógica de transcript, logs, etc.
        await ticketCloseHandler.execute(interaction);
    }
};