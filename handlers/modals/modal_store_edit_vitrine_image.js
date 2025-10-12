// Crie em: handlers/modals/modal_store_edit_vitrine_image.js
const db = require('../../database.js');
const generateCustomizeMenu = require('../../ui/store/customizeMenu.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js'); // IMPORTADO
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_edit_vitrine_image',
    async execute(interaction) {
        await interaction.deferUpdate();
        const newImage = interaction.fields.getTextInputValue('input_image_url');

        await db.query(
            `UPDATE guild_settings 
             SET store_vitrine_config = jsonb_set(COALESCE(store_vitrine_config, '{}'::jsonb), '{image_url}', to_jsonb($1::text))
             WHERE guild_id = $2`,
            [newImage, interaction.guild.id]
        );

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        await interaction.editReply({
            components: generateCustomizeMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
        
        await interaction.followUp({ content: '✅ Imagem da vitrine atualizada com sucesso!', ephemeral: true });
        
        // ATUALIZA A VITRINE
        await updateStoreVitrine(interaction.client, interaction.guild.id);
    }
};