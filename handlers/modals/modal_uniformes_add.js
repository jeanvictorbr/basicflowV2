// Crie em: handlers/modals/modal_uniformes_add.js
const db = require('../../database.js');
module.exports = {
    customId: 'modal_uniformes_add',
    async execute(interaction) {
        await interaction.deferUpdate();
        const name = interaction.fields.getTextInputValue('input_name');
        const description = interaction.fields.getTextInputValue('input_desc');
        const imageUrl = interaction.fields.getTextInputValue('input_image');
        const roleId = interaction.fields.getTextInputValue('input_role');

        const role = await interaction.guild.roles.fetch(roleId).catch(() => null);
        if (!role) {
            return interaction.followUp({ content: `❌ Erro: O ID de cargo \`${roleId}\` não foi encontrado neste servidor.`, ephemeral: true });
        }

        try {
            await db.query(
                'INSERT INTO uniforms (guild_id, name, description, image_url, role_id) VALUES ($1, $2, $3, $4, $5)',
                [interaction.guild.id, name, description, imageUrl, roleId]
            );
            await interaction.followUp({ content: '✅ Uniforme adicionado com sucesso!', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: '❌ Ocorreu um erro ao adicionar o uniforme. Verifique se o cargo já não está associado a outro uniforme.', ephemeral: true });
        }
    }
};