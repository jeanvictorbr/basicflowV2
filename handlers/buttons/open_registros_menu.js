// handlers/buttons/open_registros_menu.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');

module.exports = {
    customId: 'open_registros_menu',
    async execute(interaction) {
        // CORREÇÃO: Adicionado deferUpdate() para evitar o erro "Unknown Interaction".
        await interaction.deferUpdate();

        // Garante que a linha de configuração exista no banco de dados
        await db.query(`
            INSERT INTO guild_settings (guild_id) 
            VALUES ($1) 
            ON CONFLICT (guild_id) DO NOTHING
        `, [interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};

        // CORREÇÃO: Await e passando a 'interaction' para o gerador de menu.
        const menu = await generateRegistrosMenu(interaction, settings);

        // CORREÇÃO: Usando editReply() que é o correto após um deferUpdate().
        await interaction.editReply({
            components: menu,
        });
    }
};