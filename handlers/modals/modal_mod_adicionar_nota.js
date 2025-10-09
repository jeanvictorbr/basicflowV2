// Substitua o conteúdo em: handlers/modals/modal_mod_adicionar_nota.js
const db = require('../../database.js');
const generateDossieEmbed = require('../../ui/dossieEmbed.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_mod_adicionar_nota_',
    async execute(interaction) {
        await interaction.deferUpdate();

        const targetId = interaction.customId.split('_')[4];
        const content = interaction.fields.getTextInputValue('input_note_content');

        await db.query(
            'INSERT INTO moderation_notes (guild_id, user_id, moderator_id, content) VALUES ($1, $2, $3, $4)',
            [interaction.guild.id, targetId, interaction.user.id, content]
        );

        const member = await interaction.guild.members.fetch(targetId).catch(() => null);
        if (!member) {
            return interaction.followUp({ content: '❌ Ocorreu um erro ao recarregar o dossiê: membro não encontrado.', ephemeral: true });
        }

        const history = (await db.query('SELECT * FROM moderation_logs WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;
        const notes = (await db.query('SELECT * FROM moderation_notes WHERE user_id = $1 AND guild_id = $2 ORDER BY created_at DESC', [member.id, interaction.guild.id])).rows;
        
        // CORREÇÃO: Argumentos na ordem correta
        const dossiePayload = await generateDossieEmbed(interaction, member, history, notes, 0);
        
        await interaction.editReply({
            ...dossiePayload,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });

        await interaction.followUp({ content: '✅ Nota adicionada com sucesso ao dossiê!', ephemeral: true });
    }
};