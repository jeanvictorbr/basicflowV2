// handlers/buttons/open_registros_menu.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'open_registros_menu',
    async execute(interaction) {
        // CORREÇÃO: Adicionado deferUpdate para evitar timeout
        await interaction.deferUpdate();

        await db.query(`INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING`, [interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        // CORREÇÃO: Usando 'await' e passando 'interaction'
        const menu = await generateRegistrosMenu(interaction, settings);

        // CORREÇÃO: Usando editReply
        await interaction.editReply({
            components: menu,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};