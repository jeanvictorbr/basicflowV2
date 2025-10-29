const db = require('../../database.js');
const generatePontoMenu = require('../../ui/pontoMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;
module.exports = {
    customId: 'modal_ponto_imagem_vitrine',
    async execute(interaction) {
        const imageUrl = interaction.fields.getTextInputValue('input_url');
        await db.query(`UPDATE guild_settings SET ponto_imagem_vitrine = $1 WHERE guild_id = $2`, [imageUrl, interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        
        // --- CORREÇÃO APLICADA AQUI ---
        // 1. Adicionado 'await' porque generatePontoMenu é uma função async.
        // 2. Adicionado 'interaction' como o primeiro argumento, que era o que faltava.
        const menu = await generatePontoMenu(interaction, settingsResult.rows[0] || {});
        
        // 3. O 'menu' agora é uma variável resolvida e é passada corretamente.
        await interaction.update({ components: menu, flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};