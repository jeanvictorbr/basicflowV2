const db = require('../../database.js');

module.exports = {
    customId: 'ponto_admin_view_sessions',
    async execute(interaction) {
        const guildId = interaction.guild.id;

        // Busca apenas sessões REALMENTE abertas (Status OPEN ou sem data de fim)
        const result = await db.query(`
            SELECT session_id, user_id, start_time 
            FROM ponto_sessions 
            WHERE guild_id = $1 AND (status = 'OPEN' OR end_time IS NULL)
            ORDER BY session_id ASC
            LIMIT 15
        `, [guildId]);

        if (result.rows.length === 0) {
            return interaction.reply({ content: "✅ Tudo limpo! Nenhuma sessão ativa encontrada.", ephemeral: true });
        }

        // Montagem INTELIGENTE dos botões (Agrupa 5 por linha)
        const components = [];
        let currentRow = { type: 1, components: [] };

        result.rows.forEach((session, index) => {
            // Se a linha encheu (5 botões), salva ela e cria uma nova
            if (currentRow.components.length >= 5) {
                components.push(currentRow);
                currentRow = { type: 1, components: [] };
            }

            currentRow.components.push({
                type: 2,
                style: 4, // Vermelho (Danger)
                label: `Fechar #${session.session_id}`,
                custom_id: `ponto_force_close_${session.session_id}`
            });
        });

        // Adiciona a última linha se sobrou algum botão
        if (currentRow.components.length > 0) {
            components.push(currentRow);
        }

        // Monta o texto de lista
        const lista = result.rows.map(s => `• **#${s.session_id}** - <@${s.user_id}> (Início: <t:${Math.floor(new Date(s.start_time).getTime() / 1000)}:R>)`).join('\n');

        await interaction.reply({
            content: `🚨 **Painel de Controle de Ponto**\nEncontrei **${result.rows.length}** sessões abertas:\n\n${lista}\n\n👇 **Clique no ID abaixo para FORÇAR o fechamento:**`,
            components: components,
            ephemeral: true
        });
    }
};