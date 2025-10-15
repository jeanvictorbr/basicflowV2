// Substitua o conteúdo em: handlers/buttons/ticket_dm_claim.js
const db = require('../../database.js');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const generateDmStaffControlEmbed = require('../../ui/tickets/dmStaffControlEmbed.js');

module.exports = {
    customId: 'ticket_dm_claim_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const ticketId = interaction.customId.split('_')[3];

        const ticketResult = await db.query('SELECT * FROM tickets WHERE channel_id = $1', [ticketId]);
        const ticket = ticketResult.rows[0];

        if (!ticket) return interaction.editReply('❌ Este ticket não foi encontrado.');
        if (ticket.claimed_by) return interaction.editReply(`Este ticket já foi assumido por <@${ticket.claimed_by}>.`);

        await db.query('UPDATE tickets SET claimed_by = $1 WHERE channel_id = $2', [interaction.user.id, ticketId]);

        const thread = await interaction.guild.channels.fetch(ticket.thread_id);
        await thread.members.add(interaction.user.id);
        await thread.send(`> 📞 <@${interaction.user.id}> assumiu o atendimento.`);

        // --- INÍCIO DA NOVA LÓGICA DE NOTIFICAÇÃO ---
        try {
            const customer = await interaction.client.users.fetch(ticket.user_id);
            const notificationEmbed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('🤝 Atendente Conectado!')
                .setDescription(`O atendente **${interaction.user.tag}** assumiu seu ticket e já está disponível para te ajudar. Você pode responder diretamente aqui para falar com ele.`);
            
            await customer.send({ embeds: [notificationEmbed] });
        } catch (dmError) {
            console.error(`[Ticket DM Claim] Falha ao notificar o usuário ${ticket.user_id}:`, dmError);
            thread.send(`⚠️ **Aviso:** Não foi possível notificar o usuário na DM. Ele pode ter as mensagens diretas desativadas.`);
        }
        // --- FIM DA NOVA LÓGICA ---

        const user = await interaction.client.users.fetch(ticket.user_id);
        const messages = await thread.messages.fetch({ limit: 20 });
        const controlPanelMessage = messages.find(m => m.embeds[0]?.title === '⚙️ Painel de Controle do Atendimento');
        
        if (controlPanelMessage) {
            const updatedTicket = { ...ticket, claimed_by: interaction.user.id };
            await controlPanelMessage.edit(generateDmStaffControlEmbed(updatedTicket, user));
        }
        
        const row = ActionRowBuilder.from(interaction.message.components[0]);
        const claimButton = row.components.find(c => c.data.custom_id.startsWith('ticket_dm_claim'));
        claimButton.setDisabled(true).setLabel(`Em atendimento por ${interaction.user.username}`);
        await interaction.message.edit({ components: [row] });

        await interaction.editReply(`✅ Você assumiu o atendimento! A thread é: ${thread}`);
    }
};