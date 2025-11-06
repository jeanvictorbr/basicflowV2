// ui/captchaVerifyPanel.js

module.exports = function generateCaptchaPanel(interaction) {
    // Você pode customizar este embed como quiser
    const embed = {
        title: "✅ Verificação de Membro",
        description: "Para garantir que você não é um robô e para ter acesso completo ao servidor, por favor, clique no botão abaixo para iniciar a verificação.",
        color: 3066993, // Verde
        footer: {
            text: `Servidor: ${interaction.guild.name}`
        }
    };

    const components = [
        {
            type: 1,
            components: [
                {
                    type: 2,
                    style: 3, // Verde
                    label: "Clique para Verificar",
                    emoji: { name: "🤖" },
                    custom_id: "captcha_start_verification"
                }
            ]
        }
    ];

    // Retorna o payload completo para o `send`
    return {
        embeds: [embed],
        components: components
    };
};