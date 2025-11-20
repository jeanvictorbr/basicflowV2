const axios = require('axios');

module.exports = {
    customId: 'oauth_select_user_transfer',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const selectedValue = interaction.values[0]; // ex: "transfer_123456789"
        const targetId = selectedValue.split('_')[1];
        const guildId = interaction.guild.id;
        const authUrl = process.env.AUTH_SYSTEM_URL;

        try {
            const response = await axios.post(`${authUrl}/api/join/${targetId}/${guildId}`);
            
            if (response.data.success) {
                await interaction.editReply(`✅ **Sucesso!** O membro <@${targetId}> foi adicionado à fila de transferência.`);
            } else {
                await interaction.editReply(`⚠️ O sistema tentou, mas não conseguiu. O usuário pode já estar no servidor ou bloqueou o bot.`);
            }
        } catch (error) {
            await interaction.editReply(`❌ Erro ao processar: ${error.message}`);
        }
    }
};