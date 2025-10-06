// Crie em: handlers/modals/modal_ticket_greeting_edit.js
const db = require('../../database.js');
const generateGreetingMenu = require('../../ui/ticketsGreetingMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_ticket_greeting_edit_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();

        const messageId = interaction.customId.split('_')[4];
        const updatedMessage = interaction.fields.getTextInputValue('input_greeting_message');

        await db.query('UPDATE ticket_greeting_messages SET message = $1 WHERE id = $2 AND guild_id = $3', [updatedMessage, messageId, interaction.guild.id]);

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const messages = (await db.query('SELECT * FROM ticket_greeting_messages WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;

        await interaction.editReply({
            components: generateGreetingMenu(settings, messages),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};