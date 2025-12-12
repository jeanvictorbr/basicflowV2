const db = require('../../database.js');
const { getFormBuilderPanel } = require('../../ui/forms/formBuilderUI.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'form_create_role_sub_',
    async execute(interaction) {
        const customId = interaction.customId.split('form_create_role_sub_')[1];
        const roleName = interaction.fields.getTextInputValue('role_name');

        // Verifica se cargo já existe com esse nome, senão cria
        let role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
        
        try {
            if (!role) {
                role = await interaction.guild.roles.create({
                    name: roleName,
                    color: 'Green', // Cor padrão
                    reason: 'Criado automaticamente para Sistema de Formulários'
                });
            }

            await db.query('UPDATE forms_templates SET approved_role_id = $1 WHERE guild_id = $2 AND custom_id = $3', [role.id, interaction.guild.id, customId]);

            // Atualiza UI
            const form = await db.query('SELECT * FROM forms_templates WHERE guild_id = $1 AND custom_id = $2', [interaction.guild.id, customId]);
            const data = form.rows[0];
            const ui = getFormBuilderPanel({ 
                customId: data.custom_id, title: data.title, 
                questions: data.questions, logChannelId: data.log_channel_id, approvedRoleId: data.approved_role_id 
            });

            await interaction.update({ components: ui.components, flags: V2_FLAG });

        } catch (e) {
            await interaction.reply({ content: "Erro ao criar/definir cargo. Verifique se tenho permissão 'Gerenciar Cargos' e se meu cargo está acima dos outros.", ephemeral: true });
        }
    }
};