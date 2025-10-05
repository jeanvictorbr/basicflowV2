// Crie em: handlers/modals/modal_uniformes_edit.js
// Este é um handler dinâmico que usa startsWith
const db = require('../../database.js');
module.exports = {
    customId: 'modal_uniformes_edit_', // Usamos 'startsWith' no index.js para isso
    async execute(interaction) {
        await interaction.deferUpdate();
        const uniformId = interaction.customId.split('_')[3];
        
        const name = interaction.fields.getTextInputValue('input_name');
        const description = interaction.fields.getTextInputValue('input_desc');
        const imageUrl = interaction.fields.getTextInputValue('input_image');
        const roleId = interaction.fields.getTextInputValue('input_role');
        
        const role = await interaction.guild.roles.fetch(roleId).catch(() => null);
        if (!role) {
            return interaction.followUp({ content: `❌ Erro: O ID de cargo \`${roleId}\` não foi encontrado.`, ephemeral: true });
        }

        try {
            await db.query(
                'UPDATE uniforms SET name = $1, description = $2, image_url = $3, role_id = $4 WHERE id = $5 AND guild_id = $6',
                [name, description, imageUrl, roleId, uniformId, interaction.guild.id]
            );
            await interaction.followUp({ content: '✅ Uniforme editado com sucesso!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: '❌ Ocorreu um erro ao editar o uniforme.', ephemeral: true });
        }
    }
};