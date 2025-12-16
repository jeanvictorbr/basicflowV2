const db = require('../../database.js');

module.exports = {
    // Identificador base do modal
    customId: 'social_elogiar_submit_', // O 'handler' do seu bot deve suportar "startsWith" ou algo similar

    async execute(interaction) {
        // Pega o ID do usuário alvo que colocamos no customId do modal
        // Ex: social_elogiar_submit_123456789 -> split('_') pega o ultimo pedaço
        const parts = interaction.customId.split('_');
        const targetId = parts[parts.length - 1];
        
        // Pega o texto. Se vier vazio, usa o padrão.
        let message = interaction.fields.getTextInputValue('mensagem_input');
        if (!message || message.trim() === '') {
            message = "Um elogio especial para você!";
        }

        try {
            await interaction.deferReply({ ephemeral: true });

            // 1. Adiciona Reputação
            await db.query(`
                INSERT INTO social_users (user_id, reputation) VALUES ($1, 1)
                ON CONFLICT (user_id) DO UPDATE SET reputation = social_users.reputation + 1
            `, [targetId]);

            // 2. Salva o Log com a Mensagem
            await db.query(`
                INSERT INTO social_rep_logs (target_id, author_id, timestamp, message) 
                VALUES ($1, $2, NOW(), $3)
            `, [targetId, interaction.user.id, message]);

            // 3. Atualiza "Last Given"
            await db.query(`
                INSERT INTO social_users (user_id, last_rep_given) VALUES ($1, NOW())
                ON CONFLICT (user_id) DO UPDATE SET last_rep_given = NOW()
            `, [interaction.user.id]);

            await interaction.editReply({ 
                content: `💖 **Sucesso!** Você enviou um elogio para <@${targetId}>!\n> 💬 *"${message}"*` 
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: "❌ Ocorreu um erro ao salvar seu elogio." });
        }
    }
};