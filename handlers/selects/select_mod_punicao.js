// Crie em: handlers/selects/select_mod_punicao.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'select_mod_punicao_', // Handler dinâmico
    async execute(interaction) {
        const [_, __, ___, targetId] = interaction.customId.split('_');
        const action = interaction.values[0];

        const settings = (await db.query('SELECT mod_temp_ban_enabled FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];

        const modal = new ModalBuilder()
            .setCustomId(`modal_mod_executar_${action}_${targetId}`)
            .setTitle(`Aplicar Punição: ${action.toUpperCase()}`);

        const reasonInput = new TextInputBuilder()
            .setCustomId('input_reason')
            .setLabel("Motivo da Punição")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ex: Quebra da regra 4.2 - Comportamento inadequado.')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

        // Adiciona o campo de duração apenas se for timeout ou ban temporário (premium)
        if (action === 'timeout' || (action === 'ban' && settings.mod_temp_ban_enabled)) {
            const durationInput = new TextInputBuilder()
                .setCustomId('input_duration')
                .setLabel("Duração (ex: 10m, 1h, 7d)")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder(action === 'ban' ? 'Deixe em branco para ban permanente' : 'Ex: 1h30m')
                .setRequired(action === 'timeout'); // Duração é obrigatória para timeout
            
            modal.addComponents(new ActionRowBuilder().addComponents(durationInput));
        }

        await interaction.showModal(modal);
    }
};