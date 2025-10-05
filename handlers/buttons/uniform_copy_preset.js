// Crie em: handlers/buttons/uniform_copy_preset.js
const db = require('../../database.js');

module.exports = {
    customId: 'uniform_copy_preset_', // Handler dinâmico
    async execute(interaction) {
        const uniformId = interaction.customId.split('_')[3];
        const uniform = (await db.query('SELECT preset_code FROM uniforms WHERE id = $1', [uniformId])).rows[0];

        if (!uniform) {
            return interaction.reply({ content: 'Não foi possível encontrar o código para este uniforme.', ephemeral: true });
        }

        await interaction.reply({
            content: `Código para \`${uniform.name || 'uniforme'}\`:\n\`\`\`\n${uniform.preset_code}\n\`\`\``,
            ephemeral: true
        });
    }
};