// handlers/selects/aut_gw_draft_channel_.js
const db = require('../../database');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_gw_draft_channel_',
    async execute(interaction) {
        // Extrai o ID do draft (ex: aut_gw_draft_channel_draft_12345) -> draft_12345
        const draftId = interaction.customId.split('_').slice(4).join('_') || interaction.customId.split('_').pop(); 
        // Nota: Se o ID tiver underscores, o split pop pode pegar errado, o ideal é garantir que pegamos o resto da string
        // Mas como geramos como 'draft_'+interaction.id, o pop funciona se o ID do discord for numerico.
        // Vamos usar a logica simples do pop() que funciona para IDs do Discord padrão.
        
        const channelId = interaction.values[0];

        // ATUALIZAÇÃO: Nome da tabela corrigido
        await db.query("UPDATE automations_giveaways SET channel_id = $1 WHERE message_id = $2", [channelId, draftId]);

        // Atualiza a mensagem confirmando a seleção e habilitando o botão de publicar
        await interaction.update({
            content: "", 
            components: [
                { 
                    type: 17, 
                    components: [
                        { type: 10, content: `## 🚀 Pronto para lançar!\nCanal selecionado: <#${channelId}>\n\nClique abaixo para colocar o sorteio no ar.` },
                        { type: 14, divider: true, spacing: 2 },
                        { 
                            type: 1, 
                            components: [
                                { 
                                    type: 2, 
                                    style: 3, // Green
                                    label: "CONFIRMAR E PUBLICAR", 
                                    emoji: { name: "🚀" },
                                    custom_id: `aut_gw_publish_${draftId}` 
                                },
                                {
                                    type: 2,
                                    style: 4, // Red
                                    label: "Cancelar",
                                    custom_id: `aut_gw_cancel_${draftId}`
                                }
                            ] 
                        }
                    ]
                }
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};