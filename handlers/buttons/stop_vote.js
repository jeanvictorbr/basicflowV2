// Crie este arquivo em: handlers/buttons/stop_vote.js
const db = require('../../database.js');

module.exports = {
    customId: 'stop_vote_',
    async execute(interaction) {
        const [,, submissionId, isValidStr] = interaction.customId.split('_');
        const isValid = isValidStr === 'true';

        await db.query(
            `INSERT INTO stop_votes (submission_id, voter_id, is_valid) VALUES ($1, $2, $3)
             ON CONFLICT (submission_id, voter_id) DO UPDATE SET is_valid = $3`,
            [submissionId, interaction.user.id, isValid]
        );

        await interaction.reply({ content: `Seu voto (${isValid ? 'Válido' : 'Inválido'}) foi registrado!`, ephemeral: true });
    }
};