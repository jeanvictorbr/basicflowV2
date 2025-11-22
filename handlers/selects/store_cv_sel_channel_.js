// Arquivo: handlers/selects/store_cv_sel_channel_.js
const db = require('../../database');
const updateStoreVitrine = require('../../utils/updateStoreVitrine');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'store_cv_sel_channel_', // Prefixo para detecção dinâmica
    execute: async (interaction) => {
        const client = interaction.client; // Obtém o client corretamente
        const categoryId = interaction.customId.split('_').pop();
        const channelId = interaction.values[0];

        const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
        if (!channel) {
            return interaction.reply({ 
                content: '❌ Canal inválido ou sem permissão.', 
                flags: EPHEMERAL_FLAG 
            });
        }

        // Adia a resposta pois o updateStoreVitrine pode demorar
        await interaction.deferUpdate();

        // Envia mensagem placeholder inicial
        let msg;
        try {
            msg = await channel.send({ content: '🔄 **Inicializando vitrine da categoria...**' });
        } catch (error) {
            return interaction.followUp({ 
                content: `❌ Não consegui enviar mensagem no canal ${channel}. Verifique minhas permissões.`, 
                flags: EPHEMERAL_FLAG 
            });
        }

        // Salva no Banco de Dados
        await db.query(
            'UPDATE store_categories SET vitrine_channel_id = $1, vitrine_message_id = $2 WHERE id = $3',
            [channelId, msg.id, categoryId]
        );

        // Gera a vitrine real
        try {
            await updateStoreVitrine(client, interaction.guild.id, categoryId);
            
            await interaction.followUp({ 
                content: `✅ **Sucesso!** A vitrine da categoria foi publicada e configurada em ${channel}.`, 
                flags: EPHEMERAL_FLAG 
            });
        } catch (error) {
            console.error('[Store Publish] Erro ao gerar vitrine:', error);
            await interaction.followUp({ 
                content: '⚠️ A vitrine foi vinculada, mas ocorreu um erro ao gerar o visual inicial. Tente editar algo na categoria para forçar uma atualização.', 
                flags: EPHEMERAL_FLAG 
            });
        }
    }
};