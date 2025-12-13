// handlers/buttons/aut_button_roles_menu.js
const db = require('../../database.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_button_roles_menu',
    async execute(interaction) {
        // [CORREÇÃO] Usamos deferReply em vez de deferUpdate para criar uma NOVA mensagem
        // Isso evita o conflito de flags V2 com o menu anterior.
        await interaction.deferReply({ ephemeral: true });

        let panels = [];
        try {
            const res = await db.query('SELECT * FROM button_role_panels WHERE guild_id = $1 ORDER BY panel_id DESC', [interaction.guild.id]);
            panels = res.rows;
        } catch (error) {
            console.error("Erro ao buscar painéis:", error);
        }

        const embed = new EmbedBuilder()
            .setTitle('🔘 Gerenciador de Cargos Interativos')
            .setDescription('Aqui você pode criar e gerenciar seus painéis de "Button Roles" (Cargos por clique).')
            .setColor('Blue')
            .addFields(
                { name: '📦 Painéis Criados', value: `${panels.length}`, inline: true }
            );

        const components = [];

        // 1. Menu de Seleção para Editar/Excluir
        if (panels.length > 0) {
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('aut_btn_sel_') 
                .setPlaceholder('📝 Selecione um painel para gerenciar...')
                .addOptions(panels.slice(0, 25).map(p => ({
                    label: p.title ? p.title.substring(0, 50) : `Painel #${p.panel_id}`,
                    description: `ID: ${p.panel_id} | ${p.roles_data ? p.roles_data.length : 0} botões configurados.`,
                    value: p.panel_id.toString(),
                    emoji: '⚙️'
                })));
            components.push(new ActionRowBuilder().addComponents(selectMenu));
        } else {
            embed.setDescription(embed.data.description + '\n\n*Você ainda não possui nenhum painel criado.*');
        }

        // 2. Botões de Ação
        const rowButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('aut_btn_create_new') // Certifique-se de ter este handler
                .setLabel('Criar Novo Painel')
                .setEmoji('➕')
                .setStyle(ButtonStyle.Success),
            // Botão para fechar, já que agora é uma mensagem separada
            new ButtonBuilder()
                .setCustomId('delete_ephemeral_reply') 
                .setLabel('Fechar Gerenciador')
                .setStyle(ButtonStyle.Secondary)
        );
        components.push(rowButtons);

        // Envia como resposta separada (editReply do deferReply)
        await interaction.editReply({ embeds: [embed], components: components });
    }
};