// handlers/modals/modal_uniformes_add.js
const db = require('../../database.js');
module.exports = {
    customId: 'modal_uniformes_add',
    async execute(interaction) {
        await interaction.deferUpdate();
        const name = interaction.fields.getTextInputValue('input_name');
        const description = interaction.fields.getTextInputValue('input_desc');
        const imageUrl = interaction.fields.getTextInputValue('input_image');
        const presetCode = interaction.fields.getTextInputValue('input_preset'); // MUDANÇA

        try {
            await db.query(
                'INSERT INTO uniforms (guild_id, name, description, image_url, preset_code) VALUES ($1, $2, $3, $4, $5)', // MUDANÇA
                [interaction.guild.id, name, description, imageUrl, presetCode]
            );
            await interaction.followUp({ content: '✅ Uniforme adicionado com sucesso!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: '❌ Ocorreu um erro ao adicionar o uniforme.', ephemeral: true });
        }
    }
};