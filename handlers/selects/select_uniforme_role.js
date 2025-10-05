// RENOMEIE o arquivo para: handlers/selects/uniform_vitrine_select.js
const db = require('../../database.js');
const generateUniformesVitrine = require('../../ui/uniformesVitrine.js');

module.exports = {
    customId: 'uniform_vitrine_select',
    async execute(interaction) {
        await interaction.deferUpdate();
        const selectedUniformId = interaction.values[0];

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const allUniformes = (await db.query('SELECT * FROM uniforms WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        const selectedUniform = allUniformes.find(uni => String(uni.id) === selectedUniformId);

        if (!selectedUniform) {
            // Este caso não deve acontecer, mas é uma segurança
            return;
        }

        const updatedVitrine = generateUniformesVitrine(settings, allUniformes, selectedUniform);
        await interaction.editReply(updatedVitrine);
    }
};