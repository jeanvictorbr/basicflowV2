// handlers/selects/aut_mass_add_role_select.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, RoleSelectMenuBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_mass_add_role_select',
    async execute(interaction) {
        const roleIdToAdd = interaction.values[0];

        // 1. Salva no cache
        const cacheKey = `mass_role_${interaction.user.id}_${interaction.guild.id}`;
        interaction.client.massRoleCache = interaction.client.massRoleCache || new Map();
        interaction.client.massRoleCache.set(cacheKey, { 
            action: 'add',
            roleToAdd: roleIdToAdd, 
            filterRoles: [] // Inicialmente vazio
        });

        // 2. Constrói o Menu de Filtro
        const row = new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder()
                .setCustomId('aut_mass_filter_select')
                .setPlaceholder('Selecione os cargos que os membros DEVEM ter (Filtro)')
                .setMinValues(1)
                .setMaxValues(20)
        );

        // 3. Constrói os Botões
        const rowBtns = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('aut_mass_add_confirm_all') 
                .setLabel('Pular Filtro (Aplicar a Todos)')
                .setStyle(ButtonStyle.Secondary),
            // [MUDANÇA] Botão Cancelar agora fecha a mensagem, pois é uma nova resposta
            new ButtonBuilder()
                .setCustomId('delete_ephemeral_reply') 
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Danger)
        );

        // [CORREÇÃO DO ERRO]
        // Usamos .reply() com ephemeral: true.
        // Isso cria uma nova mensagem flutuante "Passo 2" em cima do menu principal,
        // evitando o conflito de incompatibilidade de layouts (V2 vs Legado).
        await interaction.reply({
            content: `📂 **Passo 2:** Filtragem de Membros.\n\nO cargo <@&${roleIdToAdd}> será adicionado.\n\n❓ **Quem deve receber este cargo?**\nSelecione abaixo os cargos "Filtro". Apenas quem tiver **um dos cargos selecionados** receberá o novo cargo.\n\n*Exemplo: Se selecionar "Vip", apenas quem já é Vip ganhará o cargo novo.*`,
            components: [row, rowBtns],
            ephemeral: true
        });
    }
};