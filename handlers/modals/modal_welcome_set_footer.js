// handlers/modals/modal_welcome_set_footer.js
const db = require('../../database.js');
const generateWelcomeMenu = require('../../ui/welcomeMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_welcome_set_footer',
    async execute(interaction) {
        await interaction.deferUpdate();
        const footerText = interaction.fields.getTextInputValue('input_footer_text');
        await db.query(
            `UPDATE guild_settings SET welcome_message_config = jsonb_set(COALESCE(welcome_message_config, '{}'::jsonb), '{footer_text}', to_jsonb($1::text)) WHERE guild_id = $2`,
            [footerText, interaction.guild.id]
        );
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const menu = await generateWelcomeMenu(interaction, settings);
        await interaction.editReply({ components: [menu], flags: V2_FLAG | EPHEMERAL_FLAG });
        await interaction.followUp({ content: '✅ Rodapé da mensagem de boas-vindas atualizado!', ephemeral: true });
    }
};