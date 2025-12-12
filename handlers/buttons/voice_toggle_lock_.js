const db = require('../../database.js'); // Importação obrigatória
const { PermissionFlagsBits } = require('discord.js');
const getVoicePanel = require('../../ui/voiceControlPanel.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'voice_toggle_lock_',
    async execute(interaction) { // <--- APENAS INTERACTION
        const channelId = interaction.customId.split('_').pop();

        const tempVoice = await db.query('SELECT * FROM temp_voices WHERE channel_id = $1', [channelId]);
        if (tempVoice.rows.length === 0) return interaction.reply({ content: "Esta sala não está mais registrada.", ephemeral: true });

        if (tempVoice.rows[0].owner_id !== interaction.user.id) {
            return interaction.reply({ content: "❌ Apenas o dono da sala pode fazer isso.", ephemeral: true });
        }

        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel) return interaction.reply({ content: "Canal não encontrado.", ephemeral: true });

        const newLockState = !tempVoice.rows[0].is_locked;

        await channel.permissionOverwrites.edit(interaction.guild.id, {
            Connect: newLockState ? false : true
        });

        await db.query('UPDATE temp_voices SET is_locked = $1 WHERE channel_id = $2', [newLockState, channelId]);

        const newUI = getVoicePanel({
            channelName: channel.name,
            channelId: channel.id,
            ownerId: interaction.user.id,
            isLocked: newLockState,
            isHidden: tempVoice.rows[0].is_hidden,
            userLimit: channel.userLimit
        });

        await interaction.update({ components: newUI.components, flags: V2_FLAG });
    }
};