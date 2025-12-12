const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'form_reject_',
    async execute(interaction) {
        // Mesma lógica robusta de ID
        const parts = interaction.customId.split('_');
        const targetUserId = parts.pop(); 
        // O resto do ID não é usado na recusa, mas o targetUserId agora está correto

        const oldEmbed = interaction.message.embeds[0];
        const newEmbed = EmbedBuilder.from(oldEmbed)
            .setColor('#E74C3C') // Vermelho
            .setDescription(`**Usuário:** <@${targetUserId}>\n**Status:** ❌ Recusado por <@${interaction.user.id}>`);

        await interaction.update({ embeds: [newEmbed], components: [] });

        // Tenta avisar o usuário
        try {
            const member = await interaction.guild.members.fetch(targetUserId).catch(() => null);
            if (member) {
                await member.send(`❌ Sua aplicação em **${interaction.guild.name}** foi recusada.`);
            }
        } catch (e) {}
    }
};