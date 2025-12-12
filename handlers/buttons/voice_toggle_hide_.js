const db = require('../../database.js'); // Importação obrigatória
const { PermissionFlagsBits } = require('discord.js');
const getVoicePanel = require('../../ui/voiceControlPanel.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'voice_toggle_hide_',
    async execute(interaction) {
        const channelId = interaction.customId.split('_').pop();

        const tempVoice = await db.query('SELECT * FROM temp_voices WHERE channel_id = $1', [channelId]);
        if (tempVoice.rows.length === 0) return interaction.reply({ content: "Sala não encontrada.", ephemeral: true });

        if (tempVoice.rows[0].owner_id !== interaction.user.id) {
            return interaction.reply({ content: "❌ Apenas o dono pode gerenciar a visibilidade.", ephemeral: true });
        }

        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel) return interaction.reply({ content: "Canal de voz deletado.", ephemeral: true });

        const newHideState = !tempVoice.rows[0].is_hidden;

        await channel.permissionOverwrites.edit(interaction.guild.id, {
            ViewChannel: newHideState ? false : null
        });

        await db.query('UPDATE temp_voices SET is_hidden = $1 WHERE channel_id = $2', [newHideState, channelId]);

        const newUI = getVoicePanel({
            channelName: channel.name,
            channelId: channel.id,
            ownerId: interaction.user.id,
            isLocked: tempVoice.rows[0].is_locked,
            isHidden: newHideState,
            userLimit: channel.userLimit
        });

        await interaction.update({ components: newUI.components, flags: V2_FLAG });
    }
};