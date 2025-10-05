// handlers/selects/select_ausencia_publicar_vitrine.js
const db = require('../../database.js');
const generateVitrine = require('../../ui/ausenciaVitrineEmbed.js');
const generateAusenciasMenu = require('../../ui/ausenciasMenu.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_ausencia_publicar_vitrine',
    async execute(interaction) {
        await interaction.deferUpdate();

        const selectedChannelId = interaction.values[0];
        const channel = await interaction.guild.channels.fetch(selectedChannelId);

        if (!channel) {
            await interaction.followUp({ content: 'Canal não encontrado.', ephemeral: true });
            return;
        }

        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        const settings = settingsResult.rows[0] || {};
        
        if (!settings.ausencias_imagem_vitrine) {
             await interaction.editReply({
                content: '🚨 **Erro:** Você precisa definir uma imagem para a vitrine antes de publicá-la.',
                components: generateAusenciasMenu(settings),
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
            return;
        }

        try {
            const vitrineMessage = generateVitrine(settings);
            await channel.send(vitrineMessage);
            
            await interaction.editReply({
                content: `✅ **Vitrine publicada com sucesso no canal ${channel}!**`,
                components: generateAusenciasMenu(settings),
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error("Erro ao publicar vitrine:", error);
            await interaction.editReply({
                content: `❌ **Erro ao publicar no canal ${channel}.** Verifique se eu tenho permissão para enviar mensagens lá.`,
                components: generateAusenciasMenu(settings),
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
        }
    }
};