// Crie em: ui/ticketDepartmentSelect.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateDepartmentSelect(departments) {
    const options = departments.map(d => ({
        label: d.name,
        description: d.description?.substring(0, 100) || undefined,
        value: d.id.toString(),
        emoji: d.emoji || undefined
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`select_ticket_create_department_${Date.now()}`) // ID dinâmico
        .setPlaceholder('Selecione o departamento para o seu ticket')
        .addOptions(options);

    const cancelButton = new ButtonBuilder()
        .setCustomId('delete_ephemeral_reply') // Um handler genérico para deletar a mensagem
        .setLabel('Cancelar')
        .setStyle(ButtonStyle.Danger);

    return {
        content: 'Para direcionar seu atendimento, por favor, escolha abaixo o departamento mais adequado para a sua solicitação.',
        components: [
            new ActionRowBuilder().addComponents(selectMenu),
            new ActionRowBuilder().addComponents(cancelButton)
        ],
        ephemeral: true
    };
};