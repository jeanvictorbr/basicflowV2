// Crie este arquivo em: handlers/modals/modal_suggestions_set_cooldown.js
const db = require('../../database.js');
const generateSuggestionsMenu = require('../../ui/suggestionsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_suggestions_set_cooldown',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const minutes = parseInt(interaction.fields.getTextInputValue('input_cooldown_minutes'), 10);
        
        if (isNaN(minutes) || minutes < 0) {
            return interaction.followUp({ content: '❌ Por favor, insira um número válido (0 ou maior).', ephemeral: true });
        }

        await db.query('UPDATE guild_settings SET suggestions_cooldown_minutes = $1 WHERE guild_id = $2', [minutes, interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        await interaction.editReply({
            components: generateSuggestionsMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};