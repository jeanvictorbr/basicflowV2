// handlers/selects/select_uniformes_publicar_vitrine.js
const db = require('../../database.js');
const generateUniformesVitrine = require('../../ui/uniformesVitrine.js');
const generateUniformesMenu = require('../../ui/uniformesMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_uniformes_publicar_vitrine',
    async execute(interaction) {
        await interaction.deferUpdate();
        const channel = await interaction.guild.channels.fetch(interaction.values[0]).catch(() => null);
        if (!channel) return interaction.followUp({ content: '❌ Canal não encontrado.', ephemeral: true });

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const uniforms = (await db.query('SELECT * FROM uniforms WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;

        try {
            // A CHAMADA AGORA PASSA O OBJETO 'interaction'
            const vitrineMessage = generateUniformesVitrine(interaction, settings, uniforms, uniforms[0] || null);
            await channel.send(vitrineMessage);
            
            await interaction.editReply({ components: generateUniformesMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
            await interaction.followUp({ content: `✅ **Vitrine de uniformes publicada com sucesso em ${channel}!**`, ephemeral: true });
        } catch (error) {
            console.error("Erro ao publicar vitrine:", error);
            await interaction.followUp({ content: `❌ **Erro ao publicar.** Verifique minhas permissões.`, ephemeral: true });
        }
    }
};