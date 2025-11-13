// Substitua o conteúdo em: handlers/modals/aut_btn_add_modal_.js
const { ChannelSelectMenuBuilder, ActionRowBuilder, ChannelType } = require('discord.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_btn_add_modal_',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const annId = interaction.customId.split('_').pop();
        const label = interaction.fields.getTextInputValue('aut_btn_label');
        
        // CORREÇÃO: Pegamos o ID da mensagem do painel V2 aqui
        const v2PanelMessageId = interaction.message?.id;

        if (!v2PanelMessageId) {
            return interaction.followUp({ content: '❌ Erro de referência: Não foi possível identificar o painel original.', flags: EPHEMERAL_FLAG });
        }

        // Encurtamos o prefixo para economizar caracteres
        // Formato: prefix_ANNID_MSGID_LABELBASE64
        const labelBase64 = Buffer.from(label).toString('base64');
        const customId = `aut_btn_sel_${annId}_${v2PanelMessageId}_${labelBase64}`;

        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder('Selecione o canal de destino')
            .addChannelTypes([
                ChannelType.GuildText,
                ChannelType.GuildAnnouncement
            ]);
            
        await interaction.followUp({
            content: `✅ Texto: **${label}**\nSelecione o canal para o botão:`,
            components: [new ActionRowBuilder().addComponents(selectMenu)],
            flags: EPHEMERAL_FLAG
        });
    }
};