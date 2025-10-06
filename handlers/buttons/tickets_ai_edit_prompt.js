// Crie em: handlers/buttons/tickets_ai_edit_prompt.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'tickets_ai_edit_prompt',
    async execute(interaction) {
        const settings = (await db.query('SELECT tickets_ai_assistant_prompt FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        
        const defaultPrompt = `Você é um assistente de suporte para um servidor do Discord chamado "${interaction.guild.name}". Seu objetivo é dar uma primeira resposta útil e amigável ao utilizador que abriu o ticket. Analise a mensagem do utilizador e, se for uma pergunta comum, tente respondê-la. Se for um problema complexo, peça mais detalhes específicos (como ID no jogo, screenshots, vídeos) para que a equipa humana possa resolver mais rápido. Seja breve e direto.`;

        const modal = new ModalBuilder()
            .setCustomId('modal_ai_edit_prompt')
            .setTitle('Editar Instruções do Assistente de IA');

        const promptInput = new TextInputBuilder()
            .setCustomId('input_ai_prompt')
            .setLabel("Instruções para a IA")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Descreva como a IA deve se comportar, o contexto do seu servidor, etc.")
            .setValue(settings?.tickets_ai_assistant_prompt || defaultPrompt)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(promptInput));
        await interaction.showModal(modal);
    }
};