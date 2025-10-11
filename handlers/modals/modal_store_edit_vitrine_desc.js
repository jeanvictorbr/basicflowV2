// Crie em: handlers/modals/modal_store_edit_vitrine_desc.js
const db = require('../../database.js');
const generateCustomizeMenu = require('../../ui/store/customizeMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_edit_vitrine_desc',
    async execute(interaction) {
        await interaction.deferUpdate();
        const newDesc = interaction.fields.getTextInputValue('input_desc');

        // CORREÇÃO: Usando jsonb_set.
        await db.query(
            `UPDATE guild_settings 
             SET store_vitrine_config = jsonb_set(COALESCE(store_vitrine_config, '{}'::jsonb), '{description}', to_jsonb($1::text))
             WHERE guild_id = $2`,
            [newDesc, interaction.guild.id]
        );

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        await interaction.editReply({
            components: generateCustomizeMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
        
        await interaction.followUp({ content: '✅ Descrição da vitrine atualizada com sucesso!', ephemeral: true });
    }
};