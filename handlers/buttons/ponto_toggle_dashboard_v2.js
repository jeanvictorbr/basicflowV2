const db = require('../../database.js');
const generatePontoPremiumMenu = require('../../ui/pontoPremiumMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ponto_toggle_dashboard_v2',
    async execute(interaction) {
        // Lógica para alternar o dashboard será implementada quando você criar a nova UI
        await interaction.reply({ content: 'A interface do Dashboard V2 ainda não foi criada. Por favor, envie o design para que eu possa implementar a troca.', ephemeral: true });
        
        // Apenas para manter o menu visível após a resposta efêmera
        // const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        // await interaction.update({ components: generatePontoPremiumMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};