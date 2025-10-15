// handlers/selects/select_tickets_dm_claim_channel.js
const db = require('../../database.js');
const generateTicketsPremiumMenu = require('../../ui/ticketsPremiumMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_tickets_dm_claim_channel',
    async execute(interaction) {
        const channelId = interaction.values[0];
        await db.query(`
            UPDATE guild_settings 
            SET tickets_dm_claim_channel_id = $1 
            WHERE guild_id = $2`, 
            [channelId, interaction.guild.id]
        );
        
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        
        // --- CORREÇÃO APLICADA AQUI ---
        // Removemos os campos 'content' e 'embeds' que estavam vazios e causavam o conflito
        // com a flag V2_FLAG, necessária para renderizar o menu premium.
        await interaction.update({
            components: generateTicketsPremiumMenu(settingsResult.rows[0] || {}),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};