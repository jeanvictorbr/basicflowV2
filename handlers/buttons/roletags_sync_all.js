// handlers/buttons/roletags_sync_all.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'roletags_sync_all',
    async execute(interaction) {
        const confirmationButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`roletags_sync_confirm`).setLabel('Sim, Sincronizar Todos').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`open_roletags_menu`).setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({
            components: [
                { type: 17, components: [
                    { type: 10, content: "## 🔄 Confirmação de Sincronização" },
                    { type: 10, content: "> ⚠️ **Atenção!** Esta ação irá verificar e atualizar o apelido de **todos os membros** do servidor. Dependendo do tamanho do servidor, isso pode demorar e gerar muitos eventos no log de auditoria. Deseja continuar?" }
                ]},
                confirmationButtons
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};