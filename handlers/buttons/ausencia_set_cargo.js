// handlers/buttons/ausencia_set_cargo.js
const { ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'ausencia_set_cargo',
    async execute(interaction) {
        // Cria um menu de seleção para cargos
        const selectMenu = new RoleSelectMenuBuilder()
            .setCustomId('select_ausencia_cargo') // ID para o handler do select
            .setPlaceholder('Selecione o cargo para ausentes');

        // Botão para cancelar e voltar ao menu de ausências
        const cancelButton = new ButtonBuilder()
            .setCustomId('open_ausencias_menu')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary);

        // Atualiza a mensagem com o menu de seleção e o botão de cancelar
        await interaction.update({
            embeds: [],
            content: 'Por favor, selecione o cargo que será dado aos membros quando estiverem ausentes.',
            components: [
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(cancelButton)
            ]
        });
    }
};