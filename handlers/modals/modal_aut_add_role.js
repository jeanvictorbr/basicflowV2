const db = require('../../database.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'modal_aut_add_role_',
    async execute(interaction) {
        const panelId = interaction.customId.split('_')[4];
        
        // Pega inputs
        let roleId = interaction.fields.getTextInputValue('input_role_id');
        const label = interaction.fields.getTextInputValue('input_role_label');
        const emoji = interaction.fields.getTextInputValue('input_role_emoji');

        // Limpa ID do cargo (remove <@& >)
        roleId = roleId.replace(/\D/g, '');

        await interaction.deferReply({ ephemeral: true });

        // Valida se o cargo existe
        const role = await interaction.guild.roles.fetch(roleId).catch(() => null);
        if (!role) return interaction.editReply('❌ Cargo não encontrado! Copie o ID corretamente.');

        try {
            // Busca dados atuais
            const res = await db.query('SELECT roles_data FROM button_role_panels WHERE panel_id = $1', [panelId]);
            let currentRoles = res.rows[0]?.roles_data || [];
            
            // Garante que é array
            if (!Array.isArray(currentRoles)) currentRoles = [];

            // Adiciona novo item
            currentRoles.push({
                role_id: roleId,
                label: label,
                emoji: emoji || null
            });

            // Salva de volta (IMPORTANTE: converter para JSON string se o driver exigir, mas JSONB geralmente aceita objeto direto)
            await db.query('UPDATE button_role_panels SET roles_data = $1 WHERE panel_id = $2', [JSON.stringify(currentRoles), panelId]);

            // Confirmação
            const embed = new EmbedBuilder()
                .setTitle('✅ Item Adicionado!')
                .setDescription(`O cargo **${role.name}** foi adicionado ao painel.\nTotal de itens: ${currentRoles.length}`)
                .setColor('Green');
            
            // Botões para continuar
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`aut_btn_add_item_${panelId}`).setLabel('Adicionar Outro').setStyle(ButtonStyle.Primary).setEmoji('➕'),
                new ButtonBuilder().setCustomId(`aut_btn_send_panel_${panelId}`).setLabel('Atualizar/Enviar Painel').setStyle(ButtonStyle.Success).setEmoji('📤')
            );

            await interaction.editReply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Erro ao salvar item no banco.');
        }
    }
};