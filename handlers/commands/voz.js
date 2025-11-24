const generateVoiceSelectMenu = require('../../ui/voiceSelectMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = async function(interaction) {
    // Busca os canais da guilda
    const channels = await interaction.guild.channels.fetch();
    
    // Gera o menu
    const payload = generateVoiceSelectMenu(interaction.guild, channels);

    // Responde de forma efêmera
    await interaction.reply({
        components: payload.components,
        flags: V2_FLAG | EPHEMERAL_FLAG
    });
};