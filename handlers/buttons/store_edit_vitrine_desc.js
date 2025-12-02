const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_edit_vitrine_desc',
    async execute(interaction) {
        const res = await db.query('SELECT store_vitrine_config FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        const settings = res.rows[0] || {};
        const config = settings.store_vitrine_config || {};

        const modal = new ModalBuilder()
            .setCustomId('store_edit_vitrine_desc_modal')
            .setTitle('Editar Descrição da Vitrine');

        const descInput = new TextInputBuilder()
            .setCustomId('store_vitrine_desc_input')
            .setLabel("Nova Descrição")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Digite a descrição da sua loja aqui...")
            .setMaxLength(3000)
            .setRequired(true);

        // Verifica chaves 'description' ou 'desc' para compatibilidade
        const currentVal = config.description || config.desc || 'Explore nossos produtos abaixo e abra um ticket para comprar!';
        
        // Garante que seja string e corta se for muito grande
        descInput.setValue(String(currentVal).substring(0, 3000));

        const firstActionRow = new ActionRowBuilder().addComponents(descInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    }
};