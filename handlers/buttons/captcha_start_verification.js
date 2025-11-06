// handlers/buttons/captcha_start_verification.js
const db = require('../../database.js');
const { generateCaptchaCode } = require('../../utils/captchaGenerator.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'captcha_start_verification',
    async execute(interaction) {
        const { guild, user } = interaction;

        // 1. Verificar se o sistema está ativo
        const settings = (await db.query('SELECT captcha_verify_enabled, captcha_verify_roles_to_grant FROM guild_settings WHERE guild_id = $1', [guild.id])).rows[0];
        if (!settings || !settings.captcha_verify_enabled) {
            return interaction.reply({ content: '❌ O sistema de verificação por CAPTCHA está desativado neste servidor.', ephemeral: true });
        }

        // 2. Verificar se o usuário já tem os cargos
        if (settings.captcha_verify_roles_to_grant && settings.captcha_verify_roles_to_grant.length > 0) {
            const hasRole = interaction.member.roles.cache.hasAny(...settings.captcha_verify_roles_to_grant);
            if (hasRole) {
                return interaction.reply({ content: '✅ Você já está verificado!', ephemeral: true });
            }
        } else {
             return interaction.reply({ content: '⚠️ O sistema de CAPTCHA está ativo, mas nenhum cargo foi configurado pela administração.', ephemeral: true });
        }

        // 3. Gerar e salvar o código
        const code = generateCaptchaCode(6);
        
        try {
            await db.query(
                'INSERT INTO pending_captchas (user_id, guild_id, captcha_code) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET captcha_code = $3, created_at = NOW()',
                [user.id, guild.id, code]
            );
        } catch (dbError) {
             console.error("[Captcha DB] Erro ao salvar código:", dbError);
             return interaction.reply({ content: '❌ Ocorreu um erro ao iniciar sua verificação. Tente novamente.', ephemeral: true });
        }

        // 4. Gerar imagem (simulada com texto por enquanto) e mostrar o modal
        // Em um sistema real, usaríamos uma lib como 'canvas' para gerar uma imagem, mas isso é complexo.
        // Para uma implementação "cirúrgica" e sem dependências, vamos exibir o código em um embed.
        // Para dificultar a leitura por bots, podemos adicionar espaços. C O D E G O
        const spacedCode = code.split('').join(' ');

        const embed = new EmbedBuilder()
            .setTitle("🤖 Verificação por CAPTCHA")
            .setDescription(`Por favor, digite o código abaixo no campo que apareceu para provar que você é humano.\n\n\`\`\`\n${spacedCode}\n\`\`\``)
            .setColor("Yellow")
            .setFooter({ text: "Este código expira em 5 minutos."});

        // 5. Criar e exibir o Modal
        const modal = {
            title: "Verificação de Humano",
            custom_id: "modal_captcha_submit",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4, // Input de Texto
                            custom_id: "input_captcha_code",
                            label: "Digite o código que você vê",
                            style: 1, // Short
                            min_length: 6,
                            max_length: 6,
                            placeholder: "ABCXYZ",
                            required: true
                        }
                    ]
                }
            ]
        };

        // Responder à interação com o modal E o embed de instrução (ephemeral)
        // O Discord não permite enviar um embed e um modal ao mesmo tempo.
        // A melhor abordagem é enviar o modal e, na resposta do modal, verificar.
        
        // CORREÇÃO: O Discord só permite `showModal` como a *primeira* resposta.
        // O usuário terá que ver o código no modal.
        
        const modalComCodigo = {
            title: "Verificação por CAPTCHA",
            custom_id: "modal_captcha_submit",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4, // Input de Texto
                            custom_id: "input_captcha_code",
                            label: `Digite o código: ${code}`, // Exibe o código diretamente aqui
                            style: 1, // Short
                            min_length: 6,
                            max_length: 6,
                            placeholder: "Digite o código acima",
                            required: true
                        }
                    ]
                }
            ]
        };

        await interaction.showModal(modalComCodigo);
    }
};