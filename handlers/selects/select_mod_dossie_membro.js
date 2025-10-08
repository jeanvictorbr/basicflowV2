// Substitua o conteúdo em: handlers/selects/select_mod_dossie_membro.js
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_mod_dossie_membro',
    async execute(interaction) {
        await interaction.deferUpdate();

        const memberId = interaction.values[0];
        const member = await interaction.guild.members.fetch(memberId).catch(() => null);

        if (!member) {
            return interaction.followUp({ content: '❌ Membro não encontrado.', ephemeral: true });
        }

        const history = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;
        const notes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;

        const dossiePayload = await generateDossieEmbed(interaction, member, history, notes, 0);

        await interaction.editReply({
            ...dossiePayload,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};