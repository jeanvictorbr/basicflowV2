// handlers/buttons/mod_dossie_reset_confirm.js
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_dossie_reset_confirm_',
    async execute(interaction) {
        await interaction.deferUpdate();

        const targetId = interaction.customId.split('_')[4];
        
        // Limpa o histórico de moderação do usuário no banco de dados
        await db.query('DELETE FROM moderation_logs WHERE user_id = $1 AND guild_id = $2', [targetId, interaction.guild.id]);

        const member = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!member) {
             return interaction.editReply({ content: 'Membro não encontrado ao tentar recarregar o dossiê.', components: [] });
        }

        // Busca as notas, que não são afetadas
        const notes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;

        // Gera o dossiê novamente, com o histórico vazio e no modo de gerenciamento
        const dossiePayload = generateDossieEmbed(member, [], notes, interaction, { manageMode: true });
        
        // Edita a própria mensagem de confirmação para voltar ao dossiê atualizado
        await interaction.editReply({
            components: dossiePayload.components,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};