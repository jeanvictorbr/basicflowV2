// handlers/selects/select_registros_publicar_vitrine.js
const db = require('../../database.js');
const generateRegistroVitrine = require('../../ui/registroVitrineEmbed.js');
// --- CORREÇÃO DE FLUXO ---
const generateRegistrosVitrineMenu = require('../../ui/registrosVitrineMenu.js'); // Alterado de registrosMenu
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

        // Pega as settings atualizadas
        let settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        try {
            const vitrineMessage = generateRegistroVitrine(settings);
            await channel.send(vitrineMessage);
            
            // Atualiza o canal no DB
            await db.query(`UPDATE guild_settings SET registros_canal_vitrine = $1 WHERE guild_id = $2`, [selectedChannelId, interaction.guild.id]);
            
            // Recarrega as settings após a atualização
            settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};

            // --- CORREÇÃO DO ERRO E FLUXO ---
            const menu = await generateRegistrosVitrineMenu(interaction, settings);
            await interaction.editReply({
                ...menu, // Usa spread
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
            await interaction.followUp({ content: `✅ **Vitrine de registro publicada com sucesso no canal ${channel}!**`, ephemeral: true });

        } catch (error) {
            console.error("Erro ao publicar vitrine de registro:", error);
            
            // --- CORREÇÃO DO ERRO E FLUXO (no catch) ---
            const menu = await generateRegistrosVitrineMenu(interaction, settings);
            await interaction.editReply({
                ...menu, // Usa spread
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
            await interaction.followUp({ content: `❌ **Erro ao publicar no canal ${channel}.** Verifique se eu tenho permissão para enviar mensagens lá.`, ephemeral: true });
        }
    }
};