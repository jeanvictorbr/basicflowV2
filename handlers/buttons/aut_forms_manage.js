const db = require('../../database.js');
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_forms_manage',
    async execute(interaction) {
        const forms = await db.query('SELECT custom_id, title FROM forms_templates WHERE guild_id = $1', [interaction.guild.id]);
        
        if (forms.rows.length === 0) {
            return interaction.reply({ 
                components: [{ type: 10, content: "❌ Nenhum formulário criado ainda.", style: 3 }], 
                flags: 1 << 15, ephemeral: true 
            });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId('aut_forms_edit_select')
            .setPlaceholder('Selecione um formulário para editar/postar')
            .addOptions(forms.rows.map(f => ({ label: f.title, value: f.custom_id, description: `ID: ${f.custom_id}` })));

        await interaction.reply({
            components: [
                { type: 10, content: "⚙️ Escolha o formulário que deseja gerenciar:", style: 1 },
                { type: 1, components: [select] }
            ],
            flags: 1 << 15, ephemeral: true
        });
    }
};