// Crie em: handlers/buttons/mod_gerir_punicoes.js
const db = require('../../database.js');
const generateModeracaoPunicoesMenu = require('../../ui/moderacaoPunicoesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_gerir_punicoes',
    async execute(interaction) {
        await interaction.deferUpdate();
        const punishments = (await db.query('SELECT * FROM moderation_punishments WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        
        await interaction.editReply({
            components: generateModeracaoPunicoesMenu(punishments),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};