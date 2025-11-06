// handlers/buttons/registros_captcha_publish_panel.js
const db = require('../../database.js');
const generateCaptchaPanel = require('../../ui/captchaVerifyPanel.js');

module.exports = {
    customId: 'registros_captcha_publish_panel',
    async execute(interaction) {
        const settings = (await db.query('SELECT captcha_verify_channel_id FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];

        if (!settings || !settings.captcha_verify_channel_id) {
            return interaction.reply({ content: '❌ O canal de verificação não está configurado.', ephemeral: true });
        }

        const channel = await interaction.guild.channels.fetch(settings.captcha_verify_channel_id).catch(() => null);
        if (!channel) {
            return interaction.reply({ content: '❌ O canal de verificação configurado não foi encontrado.', ephemeral: true });
        }

        try {
            const panelPayload = generateCaptchaPanel(interaction);
            await channel.send(panelPayload);
            await interaction.reply({ content: `✅ Painel de verificação enviado para <#${channel.id}>!`, ephemeral: true });
        } catch (error) {
            console.error("[Captcha Publish] Erro ao enviar painel:", error);
            await interaction.reply({ content: '❌ Ocorreu um erro ao enviar o painel. Verifique se tenho permissões para enviar mensagens naquele canal.', ephemeral: true });
        }
    }
};