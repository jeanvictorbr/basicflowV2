// handlers/selects/aut_mass_filter_select.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'aut_mass_filter_select',
    async execute(interaction) {
        const cacheKey = `mass_role_${interaction.user.id}_${interaction.guild.id}`;
        const data = interaction.client.massRoleCache?.get(cacheKey);

        if (!data) {
            return interaction.update({ content: '❌ Sessão expirada. Comece novamente.', components: [] });
        }

        // Atualiza o cache com os cargos de filtro
        data.filterRoles = interaction.values;
        interaction.client.massRoleCache.set(cacheKey, data);

        const roleToAdd = interaction.guild.roles.cache.get(data.roleToAdd);
        const filterNames = data.filterRoles.map(r => `<@&${r}>`).join(', ');

        const embed = new EmbedBuilder()
            .setTitle('⚠️ Confirmação de Ação em Massa')
            .setColor('Yellow')
            .setDescription(`Você está prestes a adicionar um cargo para um grupo específico.`)
            .addFields(
                { name: '📥 Cargo a Adicionar', value: `${roleToAdd} (\`${roleToAdd.id}\`)`, inline: true },
                { name: '🔍 Filtro (Requer um destes)', value: filterNames, inline: false }
            )
            .setFooter({ text: 'Isso pode demorar dependendo da quantidade de membros.' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('aut_mass_execute_final') // Botão final
                .setLabel('CONFIRMAR E INICIAR')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🚀'),
            new ButtonBuilder()
                .setCustomId('aut_mass_roles_menu')
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({ content: '', embeds: [embed], components: [row] });
    }
};