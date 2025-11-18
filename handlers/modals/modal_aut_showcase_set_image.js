// File: handlers/modals/modal_aut_showcase_set_image.js
const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { getCloudflowVerifyShowcaseMenu } = require('../../ui/automations/cloudflowVerifyShowcaseMenu.js');
const { updateCloudflowShowcase } = require('../../utils/updateCloudflowShowcase.js');

module.exports = {
    customId: 'modal_aut_showcase_set_image',
    async execute(interaction) {
        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });
        const image = interaction.fields.getTextInputValue('image') || null; // Salva null se em branco
        
        try {
            await db.query(
                `INSERT INTO guild_settings (guild_id, cloudflow_verify_config)
                 VALUES ($1, $2)
                 ON CONFLICT (guild_id) DO UPDATE SET
                   cloudflow_verify_config = COALESCE(guild_settings.cloudflow_verify_config, '{}'::jsonb) || $2`,
                [interaction.guild.id, JSON.stringify({ image: image })]
            );
            await updateCloudflowShowcase(interaction.client, interaction.guild.id);
            const settings = await db.getGuildSettings(interaction.guild.id);
            const menu = getCloudflowVerifyShowcaseMenu(settings || {});
            await interaction.editReply(menu);
        } catch (error) {
            console.error("Erro ao salvar imagem da vitrine:", error);
        }
    }
};