// handlers/buttons/ponto_open_premium_menu.js
const db = require('../../database.js');
const generatePontoPremiumMenu = require('../../ui/pontoPremiumMenu.js');
const hasFeature = require('../../utils/featureCheck.js'); // Adicionado
const V2_FLAG = 1 << 15; 
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ponto_open_premium_menu',
    async execute(interaction) {
        // CORREÇÃO: Verifica se a guild tem a feature PONTO_PREMIUM
        if (!await hasFeature(interaction.guild.id, 'PONTO_PREMIUM')) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium.', ephemeral: true });
        }

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.update({
            components: generatePontoPremiumMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};