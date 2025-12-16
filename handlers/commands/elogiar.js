const db = require('../../database.js');

module.exports = {
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const authorId = interaction.user.id;

        if (targetUser.id === authorId) {
            return interaction.reply({ content: "❌ Você não pode elogiar a si mesmo (amor próprio é bom, mas aqui não conta!).", flags: 1 << 6 });
        }

        if (targetUser.bot) {
            return interaction.reply({ content: "🤖 Bots não precisam de reputação, precisam de RAM.", flags: 1 << 6 });
        }

        // 1. Verifica Cooldown do Autor (Quem está elogiando)
        const authorData = await db.query('SELECT last_rep_given FROM social_users WHERE user_id = $1', [authorId]);
        
        const now = new Date();
        
        if (authorData.rows.length > 0 && authorData.rows[0].last_rep_given) {
            const lastRep = new Date(authorData.rows[0].last_rep_given);
            const diff = now - lastRep;
            const oneDay = 24 * 60 * 60 * 1000;

            if (diff < oneDay) {
                const nextRep = new Date(lastRep.getTime() + oneDay);
                return interaction.reply({ 
                    content: `⏳ Você já elogiou alguém hoje. Tente novamente <t:${Math.floor(nextRep.getTime() / 1000)}:R>.`, 
                    flags: 1 << 6 
                });
            }
        }

        // 2. Adiciona Reputação ao Destino
        // Upsert no destino
        await db.query(`
            INSERT INTO social_users (user_id, reputation) VALUES ($1, 1)
            ON CONFLICT (user_id) DO UPDATE SET reputation = social_users.reputation + 1
        `, [targetUser.id]);

        // 3. Atualiza Cooldown do Autor
        // Upsert no autor
        await db.query(`
            INSERT INTO social_users (user_id, last_rep_given) VALUES ($1, $2)
            ON CONFLICT (user_id) DO UPDATE SET last_rep_given = $2
        `, [authorId, now]);

        return interaction.reply({ 
            content: `🌟 **Sucesso!** Você elogiou ${targetUser}. A reputação dele(a) aumentou!`,
            flags: 1 << 6 // Opcional: pode ser público para dar hype
        });
    }
};