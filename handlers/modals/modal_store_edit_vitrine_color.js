// Crie em: handlers/modals/modal_store_edit_vitrine_color.js
const db = require('../../database.js');
const generateCustomizeMenu = require('../../ui/store/customizeMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_edit_vitrine_color',
    async execute(interaction) {
        await interaction.deferUpdate();
        const newColor = interaction.fields.getTextInputValue('input_color');

        if (!/^#[0-9A-F]{6}$/i.test(newColor)) {
            return interaction.followUp({ content: '❌ Código de cor inválido. Use o formato Hex, por exemplo: `#FFFFFF`', ephemeral: true });
        }

        // CORREÇÃO: Usando jsonb_set para uma atualização segura do JSONB.
        await db.query(
            `UPDATE guild_settings 
             SET store_vitrine_config = jsonb_set(COALESCE(store_vitrine_config, '{}'::jsonb), '{color}', to_jsonb($1::text))
             WHERE guild_id = $2`,
            [newColor, interaction.guild.id]
        );

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        await interaction.editReply({
            components: generateCustomizeMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });

        await interaction.followUp({ content: '✅ Cor da vitrine atualizada com sucesso!', ephemeral: true });
    }
};