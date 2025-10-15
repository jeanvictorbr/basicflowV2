// handlers/buttons/tickets_set_dm_claim_channel.js
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_set_dm_claim_channel',
    async execute(interaction) {
        
        // --- CORREÇÃO APLICADA ---
        // A resposta agora é construída como um componente V2, idêntico ao menu premium,
        // respeitando a exigência da API do Discord.
        
        await interaction.update({
            components: [
                {
                    type: 17, // Componente de Layout Rico (V2)
                    accent_color: 5752042,
                    components: [
                        { type: 10, content: "## Definir Canal de Atendimentos\nSelecione o canal onde os novos tickets de DM serão anunciados para a equipe." },
                        { type: 14, divider: true, spacing: 1 },
                        { // Action Row para o menu de seleção de canal
                            type: 1,
                            components: [
                                {
                                    type: 8, // Menu de Seleção de Canal
                                    custom_id: 'select_tickets_dm_claim_channel',
                                    placeholder: 'Selecione o canal para anúncios...',
                                    channel_types: [0] // Apenas canais de texto
                                }
                            ]
                        },
                        { // Action Row para o botão de cancelar
                            type: 1,
                            components: [
                                {
                                    type: 2, // Botão
                                    style: 2, // Estilo 'Secondary' (cinza)
                                    label: 'Cancelar',
                                    custom_id: 'tickets_open_premium_menu'
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