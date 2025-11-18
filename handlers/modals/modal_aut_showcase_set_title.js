// File: handlers/modals/modal_aut_showcase_set_title.js
const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { getCloudflowVerifyShowcaseMenu } = require('../../ui/automations/cloudflowVerifyShowcaseMenu.js');
const { updateCloudflowShowcase } = require('../../utils/updateCloudflowShowcase.js');

module.exports = {
    customId: 'modal_aut_showcase_set_title',
    async execute(interaction) {
        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });
        const title = interaction.fields.getTextInputValue('title');
        
        try {
            // Salva no DB (usando JSONB_SET)
            await db.query(
                `INSERT INTO guild_settings (guild_id, cloudflow_verify_config)
                 VALUES ($1, $2)
                 ON CONFLICT (guild_id) DO UPDATE SET
                   cloudflow_verify_config = COALESCE(guild_settings.cloudflow_verify_config, '{}'::jsonb) || $2`,
                [interaction.guild.id, JSON.stringify({ title: title })]
            );

            // Atualiza a mensagem pública (se existir)
            await updateCloudflowShowcase(interaction.client, interaction.guild.id);

            // Recarrega o painel de admin
            const settings = await db.getGuildSettings(interaction.guild.id);
            const menu = getCloudflowVerifyShowcaseMenu(settings || {});
            await interaction.editReply(menu);

        } catch (error) {
            console.error("Erro ao salvar título da vitrine:", error);
        }
    }
};