// File: handlers/modals/modal_oauth_mass_transfer.js
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'modal_oauth_mass_transfer',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetGuildId = interaction.fields.getTextInputValue('target_guild_id');
        const amount = parseInt(interaction.fields.getTextInputValue('transfer_amount'));

        if (isNaN(amount) || amount < 1) {
            return interaction.editReply("❌ Quantidade inválida.");
        }

        let authUrl = process.env.AUTH_SYSTEM_URL.trim().replace(/\/$/, '').replace('/auth/callback', '');
        const apiUrl = `${authUrl}/api/users`;

        try {
            // 1. Busca os usuários no banco (Filtrados pela guilda atual)
            // Se quiser puxar de TODO o banco global, mude 'guild_id' para 'all: true'
            const response = await axios.get(apiUrl, {
                params: { guild_id: interaction.guild.id, limit: amount }
            });

            const users = response.data.users;

            if (!users || users.length === 0) {
                return interaction.editReply("❌ Nenhum membro encontrado no banco de dados vinculado a este servidor.");
            }

            await interaction.editReply(`🔄 **Iniciando transferência...**\n👥 Alvo: ${users.length} membros\n🏰 Destino: ${targetGuildId}`);

            let successCount = 0;
            let failCount = 0;

            // 2. Loop de Transferência
            for (const user of users) {
                try {
                    // Chama a API de Join para cada um
                    const joinRes = await axios.post(`${authUrl}/api/join/${user.id}/${targetGuildId}`);
                    if (joinRes.data.success) successCount++;
                    else failCount++;
                } catch (e) {
                    failCount++;
                }
                // Pequeno delay para evitar rate limit do Discord
                await new Promise(r => setTimeout(r, 500));
            }

            const embed = new EmbedBuilder()
                .setTitle('📦 Transferência Concluída')
                .setColor(successCount > 0 ? '#57F287' : '#ED4245')
                .addFields(
                    { name: '✅ Sucesso', value: `${successCount}`, inline: true },
                    { name: '❌ Falha/Já no Server', value: `${failCount}`, inline: true },
                    { name: '🏰 Destino', value: `${targetGuildId}`, inline: true }
                );

            await interaction.followUp({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.editReply(`❌ Erro ao comunicar com o sistema de Auth: ${error.message}`);
        }
    }
};