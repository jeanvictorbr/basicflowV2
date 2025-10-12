// handlers/modals/modal_welcome_set_thumbnail.js
const db = require('../../database.js');
const generateWelcomeMenu = require('../../ui/welcomeMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_welcome_set_thumbnail',
    async execute(interaction) {
        await interaction.deferUpdate();
        const thumbnailUrl = interaction.fields.getTextInputValue('input_thumbnail_url');
        await db.query(
            `UPDATE guild_settings SET welcome_message_config = jsonb_set(COALESCE(welcome_message_config, '{}'::jsonb), '{thumbnail_url}', to_jsonb($1::text)) WHERE guild_id = $2`,
            [thumbnailUrl, interaction.guild.id]
        );
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const menu = await generateWelcomeMenu(interaction, settings);
        await interaction.editReply({ components: [menu], flags: V2_FLAG | EPHEMERAL_FLAG });
        await interaction.followUp({ content: '✅ Thumbnail da mensagem de boas-vindas atualizada!', ephemeral: true });
    }
};