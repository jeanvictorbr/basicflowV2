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
        const channel = await interaction.guild.channels.fetch(selectedChannelId).catch(() => null);

        if (!channel) {
            return interaction.followUp({ content: 'Canal não encontrado.', ephemeral: true });
        }

        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        const settings = settingsResult.rows[0] || {};
        
        // Verificação para garantir que a imagem foi definida
        if (!settings.registros_imagem_vitrine) {
             await interaction.editReply({
                // Sem content aqui
                components: generateRegistrosMenu(settings),
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
            // Envia uma mensagem de erro separada
            return interaction.followUp({ content: '🚨 **Erro:** Você precisa definir uma imagem para a vitrine antes de publicá-la.', ephemeral: true });
        }

        try {
            const vitrineMessage = generateRegistroVitrine(settings);
            await channel.send(vitrineMessage);
            
            await db.query(`UPDATE guild_settings SET registros_canal_vitrine = $1 WHERE guild_id = $2`, [selectedChannelId, interaction.guild.id]);
            
            await interaction.editReply({
                components: generateRegistrosMenu(settings),
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
            // Mensagem de sucesso enviada separadamente
            await interaction.followUp({ content: `✅ **Vitrine de registro publicada com sucesso no canal ${channel}!**`, ephemeral: true });

        } catch (error) {
            console.error("Erro ao publicar vitrine de registro:", error);
            await interaction.editReply({
                components: generateRegistrosMenu(settings),
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
            await interaction.followUp({ content: `❌ **Erro ao publicar no canal ${channel}.** Verifique se eu tenho permissão para enviar mensagens lá.`, ephemeral: true });
        }
    }
};