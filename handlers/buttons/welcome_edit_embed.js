// handlers/buttons/welcome_edit_embed.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'welcome_edit_embed',
    async execute(interaction) {
        const settings = (await db.query('SELECT welcome_message_config FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const config = settings.welcome_message_config || {};

        const modal = new ModalBuilder().setCustomId('modal_welcome_edit_embed').setTitle('Editar Mensagem de Boas-Vindas');

        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_title').setLabel("Título").setStyle(TextInputStyle.Short).setValue(config.title || '👋 Bem-vindo(a) ao {server.name}!').setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_description').setLabel("Descrição").setStyle(TextInputStyle.Paragraph).setValue(config.description || 'Estamos felizes por ter você aqui, {user.mention}!').setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_color').setLabel("Cor (Hex)").setStyle(TextInputStyle.Short).setValue(config.color || '#2ECC71').setRequired(false)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_image_url').setLabel("URL da Imagem Principal").setStyle(TextInputStyle.Short).setValue(config.image_url || '').setRequired(false))
        );

        await interaction.showModal(modal);
    }
};