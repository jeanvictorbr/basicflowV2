// handlers/modals/modal_uniformes_add.js
const db = require('../../database.js');
const updateUniformVitrine = require('../../utils/updateUniformVitrine.js');

module.exports = {
    customId: 'modal_uniformes_add',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const name = interaction.fields.getTextInputValue('input_name');
        const description = interaction.fields.getTextInputValue('input_desc');
        const imageUrl = interaction.fields.getTextInputValue('input_image');
        const presetCode = interaction.fields.getTextInputValue('input_preset');

        try {
            await db.query(
                'INSERT INTO uniforms (guild_id, name, description, image_url, preset_code) VALUES ($1, $2, $3, $4, $5)',
                [interaction.guild.id, name, description, imageUrl, presetCode]
            );
            await interaction.editReply({ content: '✅ Uniforme adicionado com sucesso!' });
            
            // ATUALIZA A VITRINE
            await updateUniformVitrine(interaction.client, interaction.guild.id);
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao adicionar o uniforme.' });
        }
    }
};