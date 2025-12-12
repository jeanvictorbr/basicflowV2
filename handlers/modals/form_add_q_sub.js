const db = require('../../database.js');
const { getFormBuilderPanel } = require('../../ui/forms/formBuilderUI.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'form_add_q_sub_',
    async execute(interaction) {
        const customId = interaction.customId.split('form_add_q_sub_')[1];
        const label = interaction.fields.getTextInputValue('label');
        let style = parseInt(interaction.fields.getTextInputValue('style'));
        
        if (style !== 1 && style !== 2) style = 2; // Default Longa

        const form = await db.query('SELECT * FROM forms_templates WHERE guild_id = $1 AND custom_id = $2', [interaction.guild.id, customId]);
        if (form.rows.length === 0) return interaction.reply({ content: "Formulário não encontrado.", ephemeral: true });

        const questions = form.rows[0].questions;
        if (questions.length >= 5) return interaction.reply({ content: "Máximo de 5 perguntas atingido.", ephemeral: true });

        // Adiciona nova pergunta
        questions.push({
            id: `q${questions.length + 1}`,
            label: label,
            style: style,
            required: true
        });

        // Salva
        await db.query('UPDATE forms_templates SET questions = $1 WHERE guild_id = $2 AND custom_id = $3', [JSON.stringify(questions), interaction.guild.id, customId]);

        // Atualiza UI
        const builderUI = getFormBuilderPanel({ 
            customId, 
            title: form.rows[0].title, 
            questions: questions, 
            logChannelId: form.rows[0].log_channel_id 
        });

        // IMPORTANTE: Como viemos de um modal, usamos update se possível, ou editReply se deferred. 
        // Modais em resposta a botões editam a mensagem original se usarmos update.
        await interaction.update({ components: builderUI.components, flags: V2_FLAG });
    }
};