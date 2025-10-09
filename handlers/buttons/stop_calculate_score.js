// Crie este arquivo em: handlers/buttons/stop_calculate_score.js
const db = require('../../database.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'stop_calculate_score',
    async execute(interaction) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Apenas um administrador pode finalizar a votação.', ephemeral: true });
        }
        await interaction.deferUpdate();

        const game = (await db.query('SELECT * FROM stop_games WHERE message_id = $1', [interaction.message.id])).rows[0];
        if (!game || game.status !== 'voting') return;

        const submissions = (await db.query('SELECT * FROM stop_submissions WHERE game_message_id = $1', [game.message_id])).rows;
        const votes = (await db.query(
            `SELECT v.* FROM stop_votes v JOIN stop_submissions s ON v.submission_id = s.id WHERE s.game_message_id = $1`,
            [game.message_id]
        )).rows;

        const scores = {};
        const validatedWords = {};

        for (const sub of submissions) {
            if (!scores[sub.user_id]) scores[sub.user_id] = 0;
            if (!validatedWords[sub.category]) validatedWords[sub.category] = [];

            const subVotes = votes.filter(v => v.submission_id === sub.id);
            const validVotes = subVotes.filter(v => v.is_valid).length;
            const invalidVotes = subVotes.length - validVotes;

            if (validVotes >= invalidVotes) {
                validatedWords[sub.category].push(sub.word.toUpperCase());
            }
        }

        let resultsDescription = '';
        for (const sub of submissions) {
            const subVotes = votes.filter(v => v.submission_id === sub.id);
            const validVotes = subVotes.filter(v => v.is_valid).length;
            const invalidVotes = subVotes.length - validVotes;
            
            let points = 0;
            if (validVotes >= invalidVotes) {
                const occurrences = validatedWords[sub.category].filter(w => w === sub.word.toUpperCase()).length;
                points = occurrences > 1 ? 5 : 10;
            }
            scores[sub.user_id] += points;
            resultsDescription += `> <@${sub.user_id}> - **${sub.category}:** \`${sub.word}\` = **${points}** pontos\n`;
        }

        if (scores[game.stopper_id] !== undefined) {
             const stopperHadInvalid = submissions.some(sub => {
                if (sub.user_id !== game.stopper_id) return false;
                const subVotes = votes.filter(v => v.submission_id === sub.id);
                return (subVotes.filter(v => !v.is_valid).length > subVotes.filter(v => v.is_valid).length);
            });
            if (!stopperHadInvalid) {
                scores[game.stopper_id] += 10;
                resultsDescription += `> \n> ⭐ <@${game.stopper_id}> ganhou +10 pontos de bônus por ter parado o jogo!\n`;
            }
        }
        
        const rankingUpdatePromises = Object.keys(scores).map(userId => 
            db.query(
                `INSERT INTO stop_ranking (guild_id, user_id, points) VALUES ($1, $2, $3)
                 ON CONFLICT (guild_id, user_id) DO UPDATE SET points = stop_ranking.points + $3`,
                [interaction.guild.id, userId, scores[userId]]
            )
        );
        await Promise.all(rankingUpdatePromises);

        const finalEmbed = new EmbedBuilder()
            .setTitle(`📊 Pontuação Final - Letra ${game.letter}`)
            .setDescription(resultsDescription)
            .setColor('Green')
            .setFooter({ text: 'O ranking geral foi atualizado!' });

        await interaction.editReply({ components: [], embeds: [finalEmbed] });
        await db.query('UPDATE stop_games SET status = $1 WHERE message_id = $2', ['finished', game.message_id]);
    }
};