// Novo Arquivo: handlers/buttons/aut_ann_edit_channel_.js
const { ChannelType } = require('discord.js');

module.exports = {
    customId: 'aut_ann_edit_channel_',
    async execute(interaction) {
        const annId = interaction.customId.split('_').pop();

        // Responde com um menu V2 contendo o seletor de canal
        const payload = [
            {
                type: 17,
                accent_color: 42751,
                components: [
                    { type: 10, content: `## 📺 Selecionar Canal\n\nEscolha o novo canal de destino para o anúncio (ID: ${annId}).` },
                    { type: 14, divider: true, spacing: 2 },
                    {
                        type: 1,
                        components: [
                            {
                                type: 8, // Channel Select
                                custom_id: `aut_ann_edit_channel_select_${annId}`,
                                channel_types: [ChannelType.GuildText], // Apenas canais de texto
                                placeholder: 'Escolha o canal de destino'
                            }
                        ]
                    },
                    { type: 14, divider: true, spacing: 2 },
                    {
                        type: 1,
                        components: [
                             {
                                type: 2, style: 2, label: 'Voltar',
                                emoji: { name: '⬅️' }, 
                                custom_id: `aut_ann_back_to_manage_${annId}` // Botão de voltar
                            }
                        ]
                    }
                ]
            }
        ];
        
        await interaction.update({ ...payload[0] });
    }
};