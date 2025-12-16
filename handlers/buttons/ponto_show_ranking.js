const { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const { generateRanking } = require('../../utils/rankingGenerator.js');

function formatTime(ms) {
    if (!ms) return "0h 0m";
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
}

module.exports = {
    customId: 'ponto_show_ranking',

    async execute(interaction) {
        if (!interaction.deferred && !interaction.replied) await interaction.deferReply({ ephemeral: true });

        try {
            // 1. CONTA O TOTAL DE REGISTROS PARA PAGINAÇÃO
            const countRes = await db.query('SELECT COUNT(*) FROM ponto_leaderboard WHERE guild_id = $1', [interaction.guild.id]);
            const totalRecords = parseInt(countRes.rows[0].count);
            const totalPages = Math.ceil(totalRecords / 10) || 1;

            // 2. BUSCA OS DADOS DA PÁGINA 1
            const res = await db.query(`
                SELECT user_id, total_ms 
                FROM ponto_leaderboard 
                WHERE guild_id = $1 
                ORDER BY total_ms DESC 
                LIMIT 10 OFFSET 0
            `, [interaction.guild.id]);

            if (res.rows.length === 0) {
                return interaction.editReply("O ranking está vazio! Ninguém bateu ponto ainda.");
            }

            // 3. Processa nomes (Guild Display Name)
            const rankingData = [];
            for (const row of res.rows) {
                let displayName = 'Desconhecido';
                let avatarUrl = 'https://cdn.discordapp.com/embed/avatars/0.png';

                try {
                    const member = await interaction.guild.members.fetch(row.user_id).catch(() => null);
                    if (member) {
                        displayName = member.displayName;
                        avatarUrl = member.displayAvatarURL({ extension: 'png', size: 128 });
                    } else {
                        const user = await interaction.client.users.fetch(row.user_id).catch(() => null);
                        if (user) {
                            displayName = user.username;
                            avatarUrl = user.displayAvatarURL({ extension: 'png', size: 128 });
                        }
                    }
                } catch (e) {}

                rankingData.push({ displayName, avatarUrl, pointsStr: formatTime(row.total_ms) });
            }

            // 4. Gera Imagem
            const buffer = await generateRanking(rankingData, interaction.guild.name, 1, totalPages);
            const attachment = new AttachmentBuilder(buffer, { name: 'ranking.png' });

            // 5. CRIA BOTÕES DE NAVEGAÇÃO
            const row = new ActionRowBuilder();
            
            // Botão Anterior (Desativado na pág 1)
            row.addComponents(new ButtonBuilder()
                .setCustomId('ponto_ranking_page_0') // ID inválido proposital ou 0
                .setEmoji('⬅️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true));

            // Botão Próximo (Ativo se tiver mais de 1 página)
            row.addComponents(new ButtonBuilder()
                .setCustomId('ponto_ranking_page_2') // Vai para página 2
                .setEmoji('➡️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(totalPages <= 1));

            await interaction.editReply({ 
                content: `🏆 **Ranking de Atividade** (Página 1/${totalPages})`,
                files: [attachment],
                components: [row]
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply("❌ Erro ao gerar o ranking.");
        }
    }
};