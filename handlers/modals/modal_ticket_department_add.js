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

        // Codifica os dados para serem passados no customId. Usamos chaves curtas para economizar espaço.
        const departmentData = JSON.stringify({ n: name, d: description, e: emoji });
        const encodedData = encodeURIComponent(departmentData);
        
        // Garante que o customId não exceda o limite de 100 caracteres.
        const baseCustomId = `select_ticket_department_role_`;
        if ((baseCustomId + encodedData).length > 100) {
            return interaction.reply({ content: 'O nome e a descrição do departamento são muito longos. Por favor, tente com textos mais curtos.', ephemeral: true });
        }

        const selectMenu = new RoleSelectMenuBuilder()
            .setCustomId(baseCustomId + encodedData) // Passa os dados aqui
            .setPlaceholder('Selecione o cargo para este departamento');
        
        const cancelButton = new ButtonBuilder().setCustomId('tickets_config_departments').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        // Atualiza a interação sem usar o campo 'content'
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};