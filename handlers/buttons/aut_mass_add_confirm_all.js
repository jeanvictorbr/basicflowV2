// handlers/buttons/aut_mass_add_confirm_all.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'aut_mass_add_confirm_all',
    async execute(interaction) {
        const cacheKey = `mass_role_${interaction.user.id}_${interaction.guild.id}`;
        const data = interaction.client.massRoleCache?.get(cacheKey);

        if (!data) return interaction.reply({ content: '❌ Sessão expirada.', ephemeral: true });

        // Define filtro como vazio (significa TODOS)
        data.filterRoles = []; 
        interaction.client.massRoleCache.set(cacheKey, data);

        const roleToAdd = interaction.guild.roles.cache.get(data.roleToAdd);

        const embed = new EmbedBuilder()
            .setTitle('⚠️ Confirmação: TODOS os Membros')
            .setColor('Orange')
            .setDescription(`Você vai adicionar o cargo ${roleToAdd} para **TODOS** os membros humanos do servidor.`)
            .setFooter({ text: 'Cuidado! Essa ação afeta muita gente.' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('aut_mass_execute_final')
                .setLabel('CONFIRMAR (TODOS)')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('aut_mass_roles_menu')
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({ content: '', embeds: [embed], components: [row] });
    }
};