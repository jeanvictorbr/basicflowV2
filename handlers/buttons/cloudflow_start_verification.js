// Local: handlers/buttons/cloudflow_start_verification.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');
// Importa a nova função de criptografia
const { encrypt } = require('../../utils/encryption'); 

module.exports = {
    customId: 'cloudflow_start_verification',
    async execute(interaction) {
        const clientId = process.env.CLIENT_ID;
        const redirectUri = process.env.REDIRECT_URI;
        
        // --- CORREÇÃO AQUI ---
        // Criptografa o ID da guilda antes de enviar no 'state'
        // Isso impede o erro "Invalid initialization vector" no site
        const stateRaw = interaction.guild.id;
        const stateEncrypted = encrypt(stateRaw);

        if (!clientId || !redirectUri) {
            return interaction.reply({ content: '❌ Configuração ausente (.env)', flags: EPHEMERAL_FLAG });
        }

        // Usa o state criptografado na URL
        const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify+guilds.join&state=${encodeURIComponent(stateEncrypted)}`;

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