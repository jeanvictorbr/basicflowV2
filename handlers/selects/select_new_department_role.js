// handlers/selects/select_new_department_role.js
const db = require('../../database.js');
const generateSuccessUI = require('../../ui/ticketDepartmentSuccess.js');

module.exports = {
    customId: 'select_new_department_role',
    async execute(interaction) {
        // Recupera dados salvos
        const tempData = interaction.client.tempDeptData?.get(interaction.user.id);
        
        if (!tempData) {
            return interaction.update({ 
                content: '❌ Dados perdidos. Tente novamente.', 
                components: [], 
                embeds: [] 
            });
        }

        // [CORREÇÃO] interaction.values É UM ARRAY ['id1', 'id2']
        const roleIds = interaction.values; 
        const rolesJson = JSON.stringify(roleIds); // Prepara para salvar no JSONB

        try {
            // Salva no Banco de Dados
            await db.query(
                `INSERT INTO ticket_departments (guild_id, name, description, emoji, role_id) VALUES ($1, $2, $3, $4, $5)`,
                [interaction.guild.id, tempData.name, tempData.description, tempData.emoji, rolesJson]
            );

            // Limpa cache
            interaction.client.tempDeptData.delete(interaction.user.id);

            // Gera a resposta visual usando o arquivo UI limpo
            const payload = generateSuccessUI(tempData.name, roleIds);
            
            // [ESTRATÉGIA ANTI-ERRO]
            // Usamos editReply se já houve defer, ou update se for direto.
            // Para garantir que não quebre com "Invalid Form Body", passamos o payload exato.
            await interaction.update(payload);

        } catch (error) {
            console.error('Erro DB:', error);
            // Tenta avisar o usuário sem quebrar tudo
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erro ao salvar. Verifique se o schema do banco foi atualizado.', ephemeral: true });
            }
        }
    }
};