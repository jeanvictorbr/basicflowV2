// Crie em: handlers/buttons/mod_open_premium_hub.js
const db = require('../../database.js');
const generateModeracaoPremiumHub = require('../../ui/moderacaoPremiumHub.js');
const isPremiumActive = require('../../utils/premiumCheck.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_open_premium_hub',
    async execute(interaction) {
        const isPremium = await isPremiumActive(interaction.guild.id);
        if (!isPremium) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium.', ephemeral: true });
        }

        await interaction.deferUpdate();
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        await interaction.editReply({
            components: generateModeracaoPremiumHub(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};