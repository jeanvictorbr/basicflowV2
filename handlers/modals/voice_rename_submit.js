const db = require('../../database.js');
const getVoicePanel = require('../../ui/voiceControlPanel.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'voice_rename_submit_',
    async execute(interaction) {
        const channelId = interaction.customId.split('_').pop();
        const newName = interaction.fields.getTextInputValue('new_name');
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel) return interaction.reply({ content: "Canal não encontrado.", ephemeral: true });

        // Tenta renomear (pode falhar se renomear muito rápido - rate limit)
        try {
            await channel.setName(newName);
        } catch (err) {
            return interaction.reply({ content: "⏳ O Discord limita renomear canais (2x a cada 10min). Tente novamente em breve.", ephemeral: true });
        }

        // Busca dados para redesenhar o painel
        const tempVoice = await db.query('SELECT * FROM temp_voices WHERE channel_id = $1', [channelId]);
        
        const newUI = getVoicePanel({
            channelName: newName,
            channelId: channelId,
            ownerId: interaction.user.id,
            isLocked: tempVoice.rows[0]?.is_locked || false,
            isHidden: tempVoice.rows[0]?.is_hidden || false,
            userLimit: channel.userLimit
        });

        // ATUALIZAÇÃO V2: Sem 'content', apenas atualizamos os componentes visuais
        await interaction.update({ 
            components: newUI.components, 
            flags: V2_FLAG 
        });
    }
};