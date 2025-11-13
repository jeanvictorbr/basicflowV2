// handlers/modals/modal_dev_search_guild.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_dev_search_guild',
    async execute(interaction) {
        await interaction.deferReply({ flags: EPHEMERAL_FLAG });

        // 1. Captura a busca e normaliza
        const query = interaction.fields.getTextInputValue('search_query').toLowerCase().trim();
        const guilds = Array.from(interaction.client.guilds.cache.values());

        // 2. Filtra os servidores (Nome ou ID)
        let filteredGuilds = guilds;
        if (query) {
            filteredGuilds = guilds.filter(g => 
                g.name.toLowerCase().includes(query) || 
                g.id === query
            );
        }

        // 3. Validações
        if (filteredGuilds.length === 0) {
            return interaction.editReply({ content: `❌ Nenhum servidor encontrado para a busca: \`${query}\`` });
        }

        // 4. Prepara as opções (Máximo 25 por limitação do Discord)
        const options = filteredGuilds.slice(0, 25).map(g => ({
            label: g.name.substring(0, 100), // Garante que cabe no label
            description: `ID: ${g.id} | Membros: ${g.memberCount}`,
            value: g.id,
        }));

        // 5. Constrói o Menu
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_dev_manage_guild') // Aponta para o seu handler de seleção existente
            .setPlaceholder(query ? `Resultados para "${query}"` : 'Selecione a guilda...')
            .addOptions(options);

        const backButton = new ButtonBuilder()
            .setCustomId('dev_manage_guilds')
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('↩️');

        // 6. Envia a resposta com V2 e Componentes
        const totalFound = filteredGuilds.length;
        const showingText = totalFound > 25 
            ? `⚠️ Mostrando 25 de **${totalFound}** resultados. Refine a busca se não encontrar.` 
            : `✅ Encontrei **${totalFound}** servidores.`;

        await interaction.editReply({
            components: [
                { 
                    type: 17, 
                    components: [
                        { type: 10, content: `## 🔎 Resultado da Busca\n> ${showingText}` }
                    ] 
                },
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(backButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};