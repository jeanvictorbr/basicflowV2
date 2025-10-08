// handlers/selects/select_mod_dossie_remove_log.js
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_mod_dossie_remove_log_',
    async execute(interaction) {
        await interaction.deferUpdate();

        const targetId = interaction.customId.split('_')[5];
        const caseId = interaction.values[0];

        await db.query('DELETE FROM moderation_logs WHERE case_id = $1', [caseId]);
        
        const member = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!member) {
            return interaction.editReply({ content: 'Membro não encontrado ao tentar recarregar o dossiê.', components: [] });
        }

        const newHistory = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;
        const notes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;

        // Gera o dossiê novamente no modo de gerenciamento
        const dossiePayload = generateDossieEmbed(member, newHistory, notes, interaction, { manageMode: true });
        
        await interaction.editReply({ components: dossiePayload.components, flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};