// Crie em: handlers/modals/modal_ai_edit_prompt.js
const db = require('../../database.js');
const generateAiMenu = require('../../ui/ticketsAiMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_ai_edit_prompt',
    async execute(interaction) {
        await interaction.deferUpdate();
        const newPrompt = interaction.fields.getTextInputValue('input_ai_prompt');

        await db.query(
            'UPDATE guild_settings SET tickets_ai_assistant_prompt = $1 WHERE guild_id = $2',
            [newPrompt, interaction.guild.id]
        );

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        await interaction.editReply({
            components: generateAiMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};