const db = require('../../database.js');
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'form_start_',
    async execute(interaction) {
        const customId = interaction.customId.split('form_start_')[1];
        
        const form = await db.query('SELECT * FROM forms_templates WHERE guild_id = $1 AND custom_id = $2', [interaction.guild.id, customId]);
        if (form.rows.length === 0) return interaction.reply({ content: "Este formulário foi deletado.", ephemeral: true });

        const data = form.rows[0];
        const questions = data.questions; // Já vem como objeto JSON graças ao pg

        const modal = new ModalBuilder()
            .setCustomId(`form_submit_${customId}`)
            .setTitle(data.title.substring(0, 45));

        // Adiciona as perguntas ao modal
        questions.forEach((q, index) => {
            const input = new TextInputBuilder()
                .setCustomId(`q_${index}`)
                .setLabel(q.label.substring(0, 45))
                .setStyle(q.style || TextInputStyle.Paragraph)
                .setRequired(q.required !== false); // Padrão true

            if(q.placeholder) input.setPlaceholder(q.placeholder.substring(0, 100));
            
            modal.addComponents(new ActionRowBuilder().addComponents(input));
        });

        await interaction.showModal(modal);
    }
};