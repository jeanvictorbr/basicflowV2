// handlers/buttons/tickets_greeting_toggle.js
const db = require('../../database.js');
const generateGreetingMenu = require('../../ui/ticketsGreetingMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_greeting_toggle',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const currentSettings = (await db.query('SELECT tickets_greeting_enabled FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const isCurrentlyEnabled = currentSettings?.tickets_greeting_enabled;

        // Se estiver desativado e prestes a ser ativado
        if (!isCurrentlyEnabled) {
            const existingMessages = (await db.query('SELECT 1 FROM ticket_greeting_messages WHERE guild_id = $1', [interaction.guild.id])).rows;
            // Se não houver nenhuma mensagem, adiciona a padrão melhorada
            if (existingMessages.length === 0) {
                const defaultMessage = 'Olá {user}! 👋\n\nSeu ticket foi aberto com sucesso no servidor **{server}**. Para agilizar seu atendimento, por favor, nos forneça o máximo de detalhes possível sobre sua solicitação. Se aplicável, inclua IDs, links ou capturas de tela.';
                await db.query('INSERT INTO ticket_greeting_messages (guild_id, message) VALUES ($1, $2)', [interaction.guild.id, defaultMessage]);
            }
        }
        
        await db.query(`UPDATE guild_settings SET tickets_greeting_enabled = NOT COALESCE(tickets_greeting_enabled, false) WHERE guild_id = $1`, [interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const messages = (await db.query('SELECT * FROM ticket_greeting_messages WHERE guild_id = $1', [interaction.guild.id])).rows;

        await interaction.editReply({
            components: generateGreetingMenu(settings, messages),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};