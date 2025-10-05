// handlers/selects/select_registros_publicar_vitrine.js
const db = require('../../database.js');
const generateRegistroVitrine = require('../../ui/registroVitrineEmbed.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_registros_publicar_vitrine',
    async execute(interaction) {
        await interaction.deferUpdate();

        const selectedChannelId = interaction.values[0];
        const channel = await interaction.guild.channels.fetch(selectedChannelId);

        if (!channel) {
            await interaction.followUp({ content: 'Canal não encontrado.', ephemeral: true });
            return;
        }

        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        
        try {
            const vitrineMessage = generateRegistroVitrine();
            await channel.send(vitrineMessage);
            
            // Salva o canal da vitrine no banco de dados para referência futura
            await db.query(`UPDATE guild_settings SET registros_canal_vitrine = $1 WHERE guild_id = $2`, [selectedChannelId, interaction.guild.id]);
            
            await interaction.editReply({
                content: `✅ **Vitrine de registro publicada com sucesso no canal ${channel}!**`,
                components: generateRegistrosMenu(settingsResult.rows[0] || {}),
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error("Erro ao publicar vitrine de registro:", error);
            await interaction.editReply({
                content: `❌ **Erro ao publicar no canal ${channel}.** Verifique se eu tenho permissão para enviar mensagens lá.`,
                components: generateRegistrosMenu(settingsResult.rows[0] || {}),
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
        }
    }
};