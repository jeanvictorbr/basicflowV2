const db = require('../../database.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    customId: 'select_new_department_role',
    async execute(interaction) {
        const tempData = interaction.client.tempDeptData?.get(interaction.user.id);
        
        if (!tempData) {
            return interaction.update({ content: '❌ Tempo esgotado. Comece novamente.', components: [], embeds: [] });
        }

        // Pega a lista de IDs selecionados (Array)
        const roleIds = interaction.values; 
        // Converte para texto JSON para salvar no banco
        const rolesJson = JSON.stringify(roleIds);

        try {
            await db.query(
                `INSERT INTO ticket_departments (guild_id, name, description, emoji, role_id) VALUES ($1, $2, $3, $4, $5)`,
                [interaction.guild.id, tempData.name, tempData.description, tempData.emoji, rolesJson]
            );

            // Limpa o cache
            interaction.client.tempDeptData.delete(interaction.user.id);

            // --- RESPOSTA SIMPLIFICADA PARA EVITAR ERRO DE API ---
            const embed = new EmbedBuilder()
                .setTitle('✅ Departamento Criado!')
                .setDescription(`O departamento **${tempData.name}** foi configurado.`)
                .addFields({ 
                    name: 'Cargos Responsáveis', 
                    value: roleIds.map(id => `<@&${id}>`).join(', ') || 'Nenhum'
                })
                .setColor('Green');

            // Atualiza a mensagem apenas com o sucesso, removendo o menu
            await interaction.update({
                content: '',
                embeds: [embed],
                components: [] 
            });

        } catch (error) {
            console.error('Erro ao salvar departamento:', error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erro ao salvar no banco de dados.', ephemeral: true });
            }
        }
    }
};