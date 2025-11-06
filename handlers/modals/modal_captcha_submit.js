// handlers/modals/modal_captcha_submit.js
const db = require('../../database.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'modal_captcha_submit',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const { guild, user } = interaction;
        const userInput = interaction.fields.getTextInputValue('input_captcha_code').toUpperCase();

        // 1. Buscar o código salvo no DB
        const captchaResult = await db.query('SELECT captcha_code FROM pending_captchas WHERE user_id = $1 AND guild_id = $2', [user.id, guild.id]);

        if (captchaResult.rows.length === 0) {
            return interaction.editReply({ content: '❌ Seu código de CAPTCHA expirou. Por favor, clique no botão para tentar novamente.', ephemeral: true });
        }

        const correctCode = captchaResult.rows[0].captcha_code;

        // 2. Limpar a tentativa do DB (mesmo se errar, para segurança)
        await db.query('DELETE FROM pending_captchas WHERE user_id = $1', [user.id]);

        // 3. Verificar se o código está correto
        if (userInput !== correctCode) {
            return interaction.editReply({ content: '❌ Código incorreto. Por favor, clique no botão e tente novamente.', ephemeral: true });
        }

        // 4. Código correto. Buscar cargos e aplicar.
        const settings = (await db.query('SELECT captcha_verify_roles_to_grant, captcha_verify_log_channel_id FROM guild_settings WHERE guild_id = $1', [guild.id])).rows[0];

        if (!settings || !settings.captcha_verify_roles_to_grant || settings.captcha_verify_roles_to_grant.length === 0) {
            return interaction.editReply({ content: '✅ Verificação concluída, mas o admin não configurou cargos para entregar.', ephemeral: true });
        }

        try {
            const rolesToGrant = settings.captcha_verify_roles_to_grant;
            await interaction.member.roles.add(rolesToGrant, 'Verificação por CAPTCHA concluída');
            
            const rolesText = rolesToGrant.map(id => `<@&${id}>`).join(', ');
            await interaction.editReply({ content: `✅ **Verificação Concluída!**\nVocê recebeu o(s) cargo(s): ${rolesText}`, ephemeral: true });

            // 5. Enviar Log
            if (settings.captcha_verify_log_channel_id) {
                const logChannel = await guild.channels.fetch(settings.captcha_verify_log_channel_id).catch(() => null);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle("🤖 Verificação por CAPTCHA")
                        .setDescription(`O membro ${user.tag} (\`${user.id}\`) foi verificado com sucesso.`)
                        .addFields({ name: 'Cargos Adicionados', value: rolesText })
                        .setColor('Green')
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }

        } catch (roleError) {
            console.error("[Captcha Roles] Erro ao adicionar cargos:", roleError);
            await interaction.editReply({ content: '❌ Fui verificado, mas ocorreu um erro ao tentar te entregar seus cargos. Verifique se meu cargo está acima dos cargos de verificação.', ephemeral: true });
        }
    }
};