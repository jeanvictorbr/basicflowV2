const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_edit_vitrine_title',
    async execute(interaction) {
        // Busca a configuração completa
        const res = await db.query('SELECT store_vitrine_config FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        const settings = res.rows[0] || {};
        const config = settings.store_vitrine_config || {};

        const modal = new ModalBuilder()
            .setCustomId('store_edit_vitrine_title_modal')
            .setTitle('Editar Título da Vitrine');

        const titleInput = new TextInputBuilder()
            .setCustomId('store_vitrine_title_input')
            .setLabel("Novo Título")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ex: Loja do Servidor")
            .setMaxLength(256)
            .setRequired(true);

        // Preenche com o valor salvo no JSON ou o padrão
        const currentVal = config.title || '🏪 Vitrine de Produtos';
        titleInput.setValue(currentVal);

        const firstActionRow = new ActionRowBuilder().addComponents(titleInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    }
};