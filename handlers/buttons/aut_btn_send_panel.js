const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'aut_btn_send_panel_',
    async execute(interaction) {
        const panelId = interaction.customId.split('_')[4];
        const panel = (await db.query('SELECT * FROM button_role_panels WHERE panel_id = $1', [panelId])).rows[0];

        if (!panel.roles_data || panel.roles_data.length === 0) {
            return interaction.reply({ content: '❌ Adicione pelo menos um cargo antes de enviar.', ephemeral: true });
        }

        const embed = {
            title: panel.title,
            description: panel.description || "Selecione seus cargos abaixo:", // Fallback seguro
            color: 0x2B2D31,
            footer: { text: 'Sistema de Auto-Cargos' }
        };
        
        if (panel.image_url && panel.image_url.startsWith('http')) {
            embed.image = { url: panel.image_url };
        }

        const options = panel.roles_data.slice(0, 25).map(r => {
            const opt = {
                label: r.label ? r.label.substring(0, 100) : 'Cargo',
                value: r.role_id,
                description: 'Clique para selecionar ou remover'
            };
            // Correção Crítica de Emoji Null
            if (r.emoji) opt.emoji = r.emoji;
            return opt;
        });

        const menu = new StringSelectMenuBuilder()
            .setCustomId('aut_role_system_interact')
            .setPlaceholder('▼ Clique aqui para selecionar seus cargos')
            .setMinValues(0) // Permite desmarcar tudo
            .setMaxValues(options.length) // Permite marcar tudo
            .addOptions(options);

        await interaction.channel.send({ 
            embeds: [embed], 
            components: [new ActionRowBuilder().addComponents(menu)] 
        });

        await interaction.reply({ content: '✅ Painel enviado com sucesso!', ephemeral: true });
    }
};