const db = require('../../database.js');
const generateSuggestionVitrine = require('../../ui/suggestionVitrine.js');
const generateSuggestionsMenu = require('../../ui/suggestionsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_suggestions_publish_vitrine',
    async execute(interaction) {
        await interaction.deferUpdate();
        const channelId = interaction.values[0];
        const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);

        if (!channel) {
            return interaction.followUp({ content: 'Canal não encontrado.', ephemeral: true });
        }

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};

        try {
            const vitrine = generateSuggestionVitrine(settings);
            await channel.send(vitrine);
            await interaction.followUp({ content: `✅ Vitrine publicada em ${channel}!`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: `❌ Erro ao publicar em ${channel}.`, ephemeral: true });
        }
        
        await interaction.editReply({
            components: generateSuggestionsMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};