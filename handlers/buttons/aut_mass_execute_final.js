// handlers/buttons/aut_mass_execute_final.js
const startMassRoleTask = require('../../utils/massRoleTask.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_mass_execute_final',
    async execute(interaction) {
        const cacheKey = `mass_role_${interaction.user.id}_${interaction.guild.id}`;
        const data = interaction.client.massRoleCache?.get(cacheKey);

        if (!data) {
            return interaction.update({ content: '❌ Erro: Sessão expirada.', components: [], embeds: [] });
        }

        // Responde o clique imediatamente
        await interaction.update({ 
            content: `⏳ **Iniciando...**\nO bot vai processar os cargos agora. Fique de olho na sua DM, eu te avisarei quando terminar!`, 
            components: [], 
            embeds: [] 
        });

        // Chama a função
        startMassRoleTask(interaction.guild, {
            action: 'add',
            roleId: data.roleToAdd,
            filterRoles: data.filterRoles,
            initiatorId: interaction.user.id // <--- ISSO É OBRIGATÓRIO PARA A DM CHEGAR
        });

        interaction.client.massRoleCache.delete(cacheKey);
    }
};