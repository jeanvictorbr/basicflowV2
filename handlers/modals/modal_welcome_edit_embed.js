// handlers/modals/modal_welcome_edit_embed.js
const db = require('../../database.js');
const generateWelcomeMenu = require('../../ui/welcomeMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_welcome_edit_embed',
    async execute(interaction) {
        await interaction.deferUpdate();

        // 1. Obter a configuração atual para não perder dados premium (thumbnail, footer)
        const settingsResult = await db.query('SELECT welcome_message_config FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        const currentConfig = settingsResult.rows[0]?.welcome_message_config || {};

        // 2. Obter os novos valores do modal
        const title = interaction.fields.getTextInputValue('input_title');
        const description = interaction.fields.getTextInputValue('input_description');
        const color = interaction.fields.getTextInputValue('input_color');
        const imageUrl = interaction.fields.getTextInputValue('input_image_url');

        // 3. Construir o novo objeto de configuração em JavaScript
        const newConfig = {
            ...currentConfig, // Mantém os valores existentes (ex: thumbnail, footer)
            title: title,
            description: description,
            color: color || null, // Guarda null se estiver vazio
            image_url: imageUrl || null // Guarda null se estiver vazio
        };

        // 4. Atualizar o banco de dados com o objeto completo
        await db.query(
            `UPDATE guild_settings SET welcome_message_config = $1 WHERE guild_id = $2`,
            [newConfig, interaction.guild.id]
        );

        // Recarregar e exibir o menu atualizado
        const updatedSettings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        // --- INÍCIO DA CORREÇÃO ---
        // Geramos o payload V2 completo
        const menuPayload = await generateWelcomeMenu(interaction, updatedSettings);
        
        // Passamos o payload V2 diretamente para o editReply, adicionando as flags
        await interaction.editReply({ ...menuPayload, flags: V2_FLAG | EPHEMERAL_FLAG });
        // --- FIM DA CORREÇÃO ---

        await interaction.followUp({ content: '✅ Mensagem de boas-vindas atualizada!', ephemeral: true });
    }
};