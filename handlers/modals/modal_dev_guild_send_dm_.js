// Crie em: handlers/modals/modal_dev_guild_send_dm_.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'modal_dev_guild_send_dm_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const guildId = interaction.customId.split('_')[5];
        const messageContent = interaction.fields.getTextInputValue('input_message');

        const guild = await interaction.client.guilds.fetch(guildId);
        const owner = await guild.fetchOwner();

        if (!owner) {
            return interaction.editReply({ content: '❌ Não foi possível encontrar o dono deste servidor.' });
        }

        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('Gold')
                .setTitle('📢 Mensagem da Equipe BasicFlow')
                .setDescription(messageContent)
                .setFooter({ text: 'Esta é uma mensagem automática enviada pelo desenvolvedor.' })
                .setImage("https://media.discordapp.net/attachments/1310610658844475404/1426807423770824704/standard_23.gif?ex=68ec9176&is=68eb3ff6&hm=3d75ef64f0087984b7c942f59037bdd91b83c7ffcef5e33438949cb66b579bc1&=")
                .setTimestamp();
            
            await owner.send({ embeds: [dmEmbed] });
            await interaction.editReply({ content: `✅ Mensagem enviada com sucesso para **${owner.user.tag}**!` });
        } catch (error) {
            console.error('[DEV DM] Erro ao enviar DM para o dono:', error);
            await interaction.editReply({ content: `❌ Falha ao enviar a mensagem. O usuário **${owner.user.tag}** pode ter as DMs desativadas.` });
        }
    }
};