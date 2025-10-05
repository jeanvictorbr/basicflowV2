// handlers/modals/modal_uniformes_edit.js
const db = require('../../database.js');
module.exports = {
    customId: 'modal_uniformes_edit_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const uniformId = interaction.customId.split('_')[3];
        
        const name = interaction.fields.getTextInputValue('input_name');
        const description = interaction.fields.getTextInputValue('input_desc');
        const imageUrl = interaction.fields.getTextInputValue('input_image');
        const presetCode = interaction.fields.getTextInputValue('input_preset'); // MUDANÇA
        
        try {
            await db.query(
                'UPDATE uniforms SET name = $1, description = $2, image_url = $3, preset_code = $4 WHERE id = $5 AND guild_id = $6', // MUDANÇA
                [name, description, imageUrl, presetCode, uniformId, interaction.guild.id]
            );
            await interaction.followUp({ content: '✅ Uniforme editado com sucesso!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: '❌ Ocorreu um erro ao editar o uniforme.', ephemeral: true });
        }
    }
};