// Substitua o conteúdo em: handlers/buttons/suggestions_start.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'suggestions_start',
    async execute(interaction) {
        const settings = (await db.query('SELECT suggestions_cooldown_minutes FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const cooldownMinutes = settings?.suggestions_cooldown_minutes ?? 2;

        if (cooldownMinutes > 0) {
            const cooldownResult = await db.query('SELECT last_suggestion_at FROM suggestion_cooldowns WHERE guild_id = $1 AND user_id = $2', [interaction.guild.id, interaction.user.id]);
            
            if (cooldownResult.rows.length > 0) {
                const lastSuggestionTime = new Date(cooldownResult.rows[0].last_suggestion_at);
                const cooldownEndTime = new Date(lastSuggestionTime.getTime() + cooldownMinutes * 60000);
                
                if (new Date() < cooldownEndTime) {
                    const timeLeft = Math.ceil((cooldownEndTime - new Date()) / 1000);
                    return interaction.reply({
                        content: `⏳ Você precisa esperar mais \`${timeLeft}\` segundos para enviar outra sugestão.`,
                        ephemeral: true
                    });
                }
            }
        }

        const modal = new ModalBuilder()
            .setCustomId('modal_suggestion_submit')
            .setTitle('Formulário de Sugestão');

        const titleInput = new TextInputBuilder()
            .setCustomId('input_suggestion_title')
            .setLabel("Título da sua Sugestão")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: Adicionar um novo carro à concessionária')
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('input_suggestion_description')
            .setLabel("Descreva sua ideia em detalhes")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Justifique sua sugestão, explique os benefícios, etc.')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descriptionInput)
        );

        await interaction.showModal(modal);
    }
};