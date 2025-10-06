// handlers/selects/select_ponto_publicar_painel.js
const db = require('../../database.js');
const generatePontoPainel = require('../../ui/pontoPainel.js');
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
            // Retorna ao menu com um aviso
            await interaction.editReply({ components: generatePontoMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
            return interaction.followUp({ content: '❌ Ative o sistema de bate-ponto antes de publicar o painel.', ephemeral: true });
        }

        try {
            const painelPayload = generatePontoPainel(settings);
            // CORREÇÃO: A estrutura V2 precisa ser enviada dentro de um objeto com a chave "components"
            await channel.send({ components: painelPayload });
            
            await interaction.editReply({ components: generatePontoMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
            await interaction.followUp({ content: `✅ **Painel de Bate-Ponto publicado com sucesso em ${channel}!**`, ephemeral: true });
        } catch (error) {
            console.error("Erro ao publicar painel de ponto:", error);
            await interaction.followUp({ content: `❌ **Erro ao publicar.** Verifique minhas permissões.`, ephemeral: true });
        }
    }
};