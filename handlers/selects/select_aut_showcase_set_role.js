// File: handlers/selects/select_aut_showcase_set_role.js
const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { getCloudflowVerifyShowcaseMenu } = require('../../ui/automations/cloudflowVerifyShowcaseMenu.js');
const { updateCloudflowShowcase } = require('../../utils/updateCloudflowShowcase.js');

module.exports = {
    customId: 'select_aut_showcase_set_role',
    async execute(interaction) {
        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });
        const roleId = interaction.values[0];
        
        try {
            // Salva o ID do cargo diretamente
            await db.query(
                `INSERT INTO guild_settings (guild_id, cloudflow_verify_role_id)
                 VALUES ($1, $2)
                 ON CONFLICT (guild_id) DO UPDATE SET
                   cloudflow_verify_role_id = $2`,
                [interaction.guild.id, roleId]
            );

            // Atualiza a mensagem pública (se existir)
            // (Embora não mude a aparência, é bom para consistência se um dia mudar)
            await updateCloudflowShowcase(interaction.client, interaction.guild.id);

            // Recarrega o painel de admin
            const settings = await db.getGuildSettings(interaction.guild.id);
            const menu = getCloudflowVerifyShowcaseMenu(settings || {});
            await interaction.editReply(menu);

        } catch (error) {
            console.error("Erro ao salvar cargo da vitrine:", error);
        }
    }
};