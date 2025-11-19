// Local: handlers/buttons/cloudflow_start_verification.js
// CONTEÚDO CORRIGIDO (Sem criptografia no state para não quebrar o fluxo)

const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'cloudflow_start_verification',
    async execute(interaction) {
        const clientId = process.env.CLIENT_ID;
        const redirectUri = process.env.REDIRECT_URI;
        
        // --- CORREÇÃO: ENVIA O ID PURO ---
        // Removemos o 'encrypt'. O ID da guilda vai como texto simples no 'state'.
        // Isso garante que o index.js receba o ID correto e salve o token na linha certa do banco.
        const stateRaw = interaction.guild.id;

        if (!clientId || !redirectUri) {
            return interaction.reply({ content: '❌ Configuração ausente (.env)', flags: EPHEMERAL_FLAG });
        }

        // URL corrigida passando o stateRaw direto
        const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify+guilds.join&state=${encodeURIComponent(stateRaw)}`;

        await interaction.reply({
            components: [
                {
                    type: 17,
                    components: [
                        {
                            type: 10,
                            content: '🔐 **Verificação Segura CloudFlow**\nClique no botão abaixo para autorizar e verificar sua conta.'
                        },
                        { type: 14, divider: true, spacing: 2 },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: 5, // Link
                                    label: 'Verificar Agora',
                                    url: oauthUrl,
                                    emoji: { name: '☁️' }
                                }
                            ]
                        }
                    ]
                }
            ],
            flags: EPHEMERAL_FLAG | V2_FLAG
        });
    },
};