// File: handlers/modals/modal_mass_transfer_global.js
const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'modal_mass_transfer_global',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetGuildId = interaction.fields.getTextInputValue('target_guild_id');
        const amount = parseInt(interaction.fields.getTextInputValue('transfer_amount'));

        if (isNaN(amount) || amount < 1) return interaction.editReply("❌ Quantidade inválida.");

        let authUrl = process.env.AUTH_SYSTEM_URL.trim().replace(/\/$/, '').replace('/auth/callback', '');

        try {
            // 1. Busca na API com all=true para pegar do banco GLOBAL
            const response = await axios.get(`${authUrl}/api/users`, {
                params: { all: 'true', limit: amount }
            });

            const users = response.data.users;
            if (!users || users.length === 0) return interaction.editReply("❌ Banco de dados vazio.");

            await interaction.editReply(`🔄 **Iniciando Transferência Global...**\n👥 ${users.length} membros selecionados\n🏰 Destino: ${targetGuildId}`);

            let success = 0;
            let fail = 0;

            for (const user of users) {
                try {
                    const res = await axios.post(`${authUrl}/api/join/${user.id}/${targetGuildId}`);
                    if (res.data.success) success++; else fail++;
                } catch (e) { fail++; }
                await new Promise(r => setTimeout(r, 500)); // Delay anti-rate limit
            }

            const embed = new EmbedBuilder()
                .setTitle('🌍 Transferência Global Finalizada')
                .setColor('#5865F2')
                .setDescription(`**Destino:** \`${targetGuildId}\`\n✅ **Sucesso:** ${success}\n❌ **Falha/Já está:** ${fail}`);

            await interaction.followUp({ embeds: [embed] });

        } catch (error) {
            await interaction.editReply(`❌ Erro: ${error.message}`);
        }
    }
};