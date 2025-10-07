// Crie em: handlers/selects/select_mod_punicao_remove.js
const db = require('../../database.js');
const generateModeracaoPunicoesMenu = require('../../ui/moderacaoPunicoesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_mod_punicao_remove',
    async execute(interaction) {
        await interaction.deferUpdate();
        const punishmentId = interaction.values[0];

        await db.query('DELETE FROM moderation_punishments WHERE punishment_id = $1 AND guild_id = $2', [punishmentId, interaction.guild.id]);

        const punishments = (await db.query('SELECT * FROM moderation_punishments WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateModeracaoPunicoesMenu(punishments),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};