// Crie em: handlers/modals/modal_ticket_department_add.js
const { RoleSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_ticket_department_add',
    async execute(interaction) {
        const name = interaction.fields.getTextInputValue('input_name');
        const description = interaction.fields.getTextInputValue('input_desc');
        const emoji = interaction.fields.getTextInputValue('input_emoji');

        // Em vez de salvar direto, guardamos os dados e pedimos para selecionar o cargo
        const tempDepartmentData = JSON.stringify({ name, description, emoji });

        const selectMenu = new RoleSelectMenuBuilder()
            .setCustomId(`select_ticket_department_role_${Date.now()}`) // ID dinâmico para carregar os dados
            .setPlaceholder('Selecione o cargo para este departamento');
        
        const cancelButton = new ButtonBuilder().setCustomId('tickets_config_departments').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        // Atualiza a interação com a seleção de cargo
        await interaction.update({
            // Usamos um campo "invisível" (content) para passar os dados do modal para o próximo handler
            content: tempDepartmentData,
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};