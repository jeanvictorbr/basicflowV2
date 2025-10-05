// Crie em: handlers/selects/select_tickets_publicar_painel.js
const db = require('../../database.js');
const generateTicketPainel = require('../../ui/ticketPainelEmbed.js');
const generateTicketsMenu = require('../../ui/ticketsMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_tickets_publicar_painel',
    async execute(interaction) {
        await interaction.deferUpdate();
        const channelId = interaction.values[0];
        const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
        if (!channel) return interaction.followUp({ content: 'Canal não encontrado.', ephemeral: true });

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        if (!settings.tickets_category || !settings.tickets_cargo_suporte || !settings.tickets_canal_logs) {
            return interaction.followUp({ content: 'Por favor, configure todas as opções (Categoria, Cargo Suporte e Canal de Logs) antes de publicar o painel.', ephemeral: true });
        }
        
        try {
            const painel = generateTicketPainel(settings);
            await channel.send(painel);
            await db.query(`UPDATE guild_settings SET tickets_painel_channel = $1 WHERE guild_id = $2`, [channelId, interaction.guild.id]);
            await interaction.editReply({ components: generateTicketsMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
            await interaction.followUp({ content: `✅ Painel publicado com sucesso em ${channel}!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: `❌ Erro ao publicar em ${channel}. Verifique minhas permissões.`, ephemeral: true });
        }
    }
};