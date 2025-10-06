// Crie em: handlers/modals/modal_ticket_greeting_edit.js
const db = require('../../database.js');
const generateGreetingMenu = require('../../ui/ticketsGreetingMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_ticket_greeting_edit',
    async execute(interaction) {
        await interaction.deferUpdate();
        const newMessage = interaction.fields.getTextInputValue('input_greeting_message');

        await db.query(
            'UPDATE guild_settings SET tickets_greeting_message = $1 WHERE guild_id = $2',
            [newMessage, interaction.guild.id]
        );

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        await interaction.editReply({
            components: generateGreetingMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};