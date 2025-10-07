// Crie em: handlers/buttons/mod_minhas_acoes_page.js
const db = require('../../database.js');
const generateMinhasAcoesEmbed = require('../../ui/minhasAcoesEmbed.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_minhas_acoes_page_', // Handler dinâmico
    async execute(interaction) {
        const page = parseInt(interaction.customId.split('_')[4], 10);
        if (isNaN(page)) return;

        await interaction.deferUpdate();
        
        const history = (await db.query('SELECT * FROM moderation_logs WHERE moderator_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [interaction.user.id, interaction.guild.id])).rows;

        await interaction.editReply({
            components: generateMinhasAcoesEmbed(interaction, history, page),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};