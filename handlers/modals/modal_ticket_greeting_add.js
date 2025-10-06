// Crie/Substitua em: handlers/modals/modal_ticket_greeting_add.js
const db = require('../../database.js');
const generateGreetingMenu = require('../../ui/ticketsGreetingMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_ticket_greeting_add',
    async execute(interaction) {
        await interaction.deferUpdate();
        const newMessage = interaction.fields.getTextInputValue('input_greeting_message');

        // Novas mensagens são ativas por padrão
        await db.query(
            'INSERT INTO ticket_greeting_messages (guild_id, message, is_active) VALUES ($1, $2, true)',
            [interaction.guild.id, newMessage]
        );

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const messages = (await db.query('SELECT * FROM ticket_greeting_messages WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        
        await interaction.editReply({
            components: generateGreetingMenu(settings, messages),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};