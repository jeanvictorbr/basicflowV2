// Crie/Substitua o conteúdo em: handlers/buttons/ticket_dm_close_confirm.js
const { AttachmentBuilder } = require('discord.js');
const db = require('../../database.js');
const createTranscript = require('../../utils/createTranscript.js');
const generateFeedbackRequester = require('../../ui/ticketFeedbackRequester.js');

module.exports = {
    customId: 'ticket_dm_close_confirm_', // Handler dinâmico
    async execute(interaction) {
        await interaction.update({ content: 'Finalizando seu atendimento, aguarde...', components: [] });

        // --- CORREÇÃO APLICADA AQUI ---
        // Extrai o ID do ticket (que é o channel_id do canal âncora) do customId do botão.
        const ticketId = interaction.customId.split('_')[4];
        
        // Busca o ticket específico pelo seu ID único e pelo usuário que clicou, garantindo que a pessoa certa está fechando o ticket certo.
        const ticketResult = await db.query("SELECT * FROM tickets WHERE channel_id = $1 AND user_id = $2 AND is_dm_ticket = true AND status = 'open'", [ticketId, interaction.user.id]);
        const ticket = ticketResult.rows[0];
        // --- FIM DA CORREÇÃO ---

        if (!ticket) {
            return interaction.followUp({ content: '❌ Não encontrei um atendimento em aberto para você ou ele já foi finalizado.', ephemeral: true });
        }

        const guild = await interaction.client.guilds.fetch(ticket.guild_id);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guild.id])).rows[0] || {};
        const thread = await guild.channels.fetch(ticket.thread_id).catch(() => null);
        
        if (!thread) {
            // Se a thread não existe, apenas fecha no banco de dados para evitar erros.
            await db.query(`UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE channel_id = $1`, [ticket.channel_id]);
            return interaction.followUp({ content: '⚠️ Não foi possível encontrar a thread de comunicação, mas o ticket foi fechado no banco de dados.', ephemeral: true });
        }
        
        // O restante da lógica para gerar transcript, enviar logs, etc., permanece a mesma.
        const transcript = await createTranscript(thread);
        const attachment = new AttachmentBuilder(Buffer.from(transcript), { name: `transcript-${ticket.channel_id}.html` });
        
        if (settings.tickets_canal_logs) {
            const logChannel = await guild.channels.fetch(settings.tickets_canal_logs).catch(() => null);
            if (logChannel) {
                await logChannel.send({ content: `Atendimento via DM de ${interaction.user.tag} foi finalizado pelo próprio usuário.`, files: [attachment] });
            }
        }
        
        await db.query(`UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE channel_id = $1`, [ticket.channel_id]);
        
        if (settings.tickets_feedback_enabled) {
            await interaction.user.send(generateFeedbackRequester(ticket)).catch(() => {});
        }
        await interaction.user.send({ content: 'Aqui está a transcrição da sua conversa:', files: [attachment] }).catch(() => {});
        
        // Deleta o canal âncora (e a thread junto)
        const anchorChannel = await guild.channels.fetch(ticket.channel_id).catch(() => null);
        if (anchorChannel) await anchorChannel.delete('Ticket finalizado pelo usuário');
        
        await interaction.followUp({ content: '✅ Seu atendimento foi finalizado com sucesso!', ephemeral: true });
    }
};