// Crie em: handlers/buttons/open_moderacao_menu.js
const db = require('../../database.js');
const generateModeracaoMenu = require('../../ui/moderacaoMenu.js');
const isPremiumActive = require('../../utils/premiumCheck.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'open_moderacao_menu',
    async execute(interaction) {
        await db.query(`INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING`, [interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const isPremium = await isPremiumActive(interaction.guild.id);

        await interaction.update({
            components: generateModeracaoMenu(settings, isPremium),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};