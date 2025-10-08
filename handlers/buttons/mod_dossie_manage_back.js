// handlers/buttons/mod_dossie_manage_back.js
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_dossie_manage_back_',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const targetId = interaction.customId.split('_')[4];
        const member = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!member) {
            return interaction.followUp({ content: '❌ Membro não encontrado.', ephemeral: true });
        }

        const history = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;
        const notes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;

        // Gera o dossiê no modo padrão
        const dossiePayload = generateDossieEmbed(member, history, notes, interaction, { manageMode: false });
        
        await interaction.editReply({
            components: dossiePayload.components,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};