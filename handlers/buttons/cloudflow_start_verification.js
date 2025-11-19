const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'cloudflow_start_verification',
    async execute(interaction) {
        const clientId = process.env.CLIENT_ID;
        const redirectUri = process.env.REDIRECT_URI;
        
        // --- CORREÇÃO CIRÚRGICA ---
        // Enviamos o ID da guilda PURO. Sem criptografia.
        // Isso garante que o index.js receba "123456" e não "[object Object]".
        const state = interaction.guild.id; 

        if (!clientId || !redirectUri) {
            return interaction.reply({ content: '❌ Configuração ausente (.env)', flags: EPHEMERAL_FLAG });
        }

        // Monta a URL com o state correto
        const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify+guilds.join&state=${encodeURIComponent(state)}`;

        await interaction.reply({
            components: [
                {
                    type: 17,
                    components: [
                        {
                            type: 10,
                            content: '🔐 **Verificação Segura**\nClique no botão abaixo para autorizar e verificar sua conta.'
                        },
                        { type: 14, divider: true, spacing: 2 },
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2,
                                    style: 5, // Link Button
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