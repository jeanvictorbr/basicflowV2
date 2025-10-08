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
        const channel = await interaction.guild.channels.fetch(selectedChannelId).catch(() => null);

        if (!channel) {
            return interaction.followUp({ content: 'Canal não encontrado.', ephemeral: true });
        }

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};

        try {
            const vitrineMessage = generateVitrine(settings);
            await channel.send(vitrineMessage);
            
            const menu = await generateAusenciasMenu(interaction, settings);
            await interaction.editReply({
                components: menu,
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
            await interaction.followUp({ content: `✅ **Vitrine publicada com sucesso no canal ${channel}!**`, ephemeral: true });

        } catch (error) {
            console.error("Erro ao publicar vitrine:", error);
            const menu = await generateAusenciasMenu(interaction, settings);
            await interaction.editReply({
                components: menu,
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
            await interaction.followUp({ content: `❌ **Erro ao publicar no canal ${channel}.** Verifique se eu tenho permissão para enviar mensagens lá.`, ephemeral: true });
        }
    }
};