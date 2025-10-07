// Crie em: handlers/buttons/mod_aplicar_punicao.js
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_aplicar_punicao_', // Handler dinâmico
    async execute(interaction) {
        const targetId = interaction.customId.split('_')[3];

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_mod_punicao_${targetId}`)
            .setPlaceholder('Selecione a punição a ser aplicada')
            .addOptions([
                { label: 'Avisar Membro (DM)', value: 'warn', emoji: '⚠️' },
                { label: 'Silenciar (Timeout)', value: 'timeout', emoji: '🔇' },
                { label: 'Expulsar (Kick)', value: 'kick', emoji: '🚪' },
                { label: 'Banir', value: 'ban', emoji: '🚫' },
            ]);
        
        // Substitui os botões do Dossiê pelo menu de seleção
        // interaction.message.components[0] é a primeira ActionRow do embed
        const existingComponents = interaction.message.components[0].components;
        const updatedComponents = existingComponents.map(component => {
            if (component.type === 17) { // Componente V2
                 // Encontra a última ActionRow (a dos botões) e substitui
                const lastActionRowIndex = component.components.findLastIndex(c => c.type === 1);
                if (lastActionRowIndex !== -1) {
                    component.components[lastActionRowIndex] = new ActionRowBuilder().addComponents(selectMenu).toJSON();
                }
            }
            return component;
        });

        await interaction.update({
            components: updatedComponents,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};