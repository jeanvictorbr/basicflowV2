// handlers/selects/select_ponto_publicar_painel.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const generatePontoMenu = require('../../ui/pontoMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_ponto_publicar_painel',
    async execute(interaction) {
        await interaction.deferUpdate();
        const channel = await interaction.guild.channels.fetch(interaction.values[0]).catch(() => null);
        if (!channel) return interaction.followUp({ content: '❌ Canal não encontrado.', ephemeral: true });

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        if (!settings.ponto_status) {
            await interaction.editReply({ components: generatePontoMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
            return interaction.followUp({ content: '❌ Ative o sistema de bate-ponto antes de publicar o painel.', ephemeral: true });
        }

        try {
            // Etapa 1: Envia o botão de carregamento para o canal alvo
            const loadButton = new ButtonBuilder()
                .setCustomId('ponto_load_vitrine')
                .setLabel('Carregar Painel de Ponto')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🔄');
            
            await channel.send({ 
                content: 'Clique no botão abaixo para carregar o painel de Bate-Ponto. (Apenas administradores podem fazer isso).',
                components: [new ActionRowBuilder().addComponents(loadButton)]
            });
            
            await interaction.editReply({ components: generatePontoMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
            await interaction.followUp({ content: `✅ **Botão de carregamento enviado para ${channel}!** Vá até o canal e clique no botão para publicar o painel.`, ephemeral: true });

        } catch (error) {
            console.error("Erro ao enviar botão de carregamento:", error);
            await interaction.followUp({ content: `❌ **Erro ao enviar o botão para ${channel}.** Verifique minhas permissões.`, ephemeral: true });
        }
    }
};