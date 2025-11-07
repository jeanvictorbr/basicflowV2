// Substitua o conteúdo em: handlers/modals/modal_store_edit_product.js
const db = require('../../database.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    customId: 'modal_store_edit_product_', // O underscore indica que é um handler dinâmico
    async execute(interaction) {
        
        const productId = interaction.customId.split('_').pop();
        
        await interaction.deferUpdate();

        // 1. Busca os dados antigos do produto
        const oldProductRes = await db.query('SELECT * FROM store_products WHERE id = $1', [productId]);
        if (oldProductRes.rows.length === 0) {
            return interaction.followUp({ content: '❌ Erro ao salvar: Produto não encontrado.', ephemeral: true });
        }
        const oldProduct = oldProductRes.rows[0];

        // 2. Coleta os novos dados do modal
        const name = interaction.fields.getTextInputValue('input_name');
        const price = parseFloat(interaction.fields.getTextInputValue('input_price').replace(',', '.'));
        const description = interaction.fields.getTextInputValue('input_desc') || null;
        const stockType = interaction.fields.getTextInputValue('input_stock_type').toUpperCase();
        
        // --- LÓGICA DE DURAÇÃO ---
        const roleDurationInput = interaction.fields.getTextInputValue('input_role_duration') || null;
        let newDuration = roleDurationInput ? parseInt(roleDurationInput, 10) : null;

        // Variáveis para a query final
        let roleIdToUpdate = oldProduct.role_id_to_grant;
        let durationToUpdate = newDuration;
        let autoRoleToUpdate = oldProduct.auto_created_role;
        // --- FIM LÓGICA ---

        if (isNaN(price)) {
            return interaction.followUp({ content: '❌ O preço deve ser um número válido.', ephemeral: true });
        }
        if (stockType !== 'REAL' && stockType !== 'GHOST') {
            return interaction.followUp({ content: '❌ Tipo de estoque inválido. Use "REAL" ou "GHOST".', ephemeral: true });
        }
        if (newDuration && (isNaN(newDuration) || newDuration <= 0)) {
            return interaction.followUp({ content: '❌ A duração do cargo deve ser um número positivo de dias.', ephemeral: true });
        }

        // 3. Compara os estados do cargo automático
        
        // Caso 1: O produto TINHA um cargo automático
        if (oldProduct.auto_created_role) {
            // Caso 1a: O admin limpou o campo de duração (REMOVENDO o cargo)
            if (!newDuration) {
                try {
                    const role = await interaction.guild.roles.fetch(oldProduct.role_id_to_grant);
                    if (role) {
                        await role.delete('Cargo automático removido da edição do produto (StoreFlow)');
                    }
                } catch (e) {
                    console.error(`[Store Edit] Falha ao deletar cargo automático ${oldProduct.role_id_to_grant}: ${e.message}`);
                }
                roleIdToUpdate = null;
                durationToUpdate = null;
                autoRoleToUpdate = false;
            }
            // Caso 1b: O admin mudou o nome do produto (precisamos renomear o cargo)
            else if (oldProduct.name !== name && roleIdToUpdate) {
                 try {
                    const role = await interaction.guild.roles.fetch(roleIdToUpdate);
                    if (role) {
                        await role.setName(name, 'Nome do produto atualizado (StoreFlow)');
                    }
                } catch (e) {
                     console.error(`[Store Edit] Falha ao renomear cargo ${roleIdToUpdate}: ${e.message}`);
                }
            }
            // (Se só mudou a duração, durationToUpdate já está com o valor certo)

        } 
        // Caso 2: O produto NÃO TINHA um cargo automático
        else {
            // Caso 2a: O admin ADICIONOU uma duração (CRIANDO um cargo)
            if (newDuration) {
                 if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    return interaction.followUp({ content: '❌ Eu não tenho permissão para "Gerenciar Cargos". Não posso criar o cargo automático.', ephemeral: true });
                }
                try {
                    const newRole = await interaction.guild.roles.create({
                        name: name,
                        reason: `Cargo temporário para o produto: ${name} (StoreFlow)`
                    });
                    roleIdToUpdate = newRole.id;
                    autoRoleToUpdate = true;
                } catch (error) {
                    console.error("[Store Edit] Erro ao criar cargo automático:", error);
                    return interaction.followUp({ content: '❌ Ocorreu um erro ao tentar criar o cargo no Discord.', ephemeral: true });
                }
            }
            // Caso 2b: Não tinha e continua não tendo. Nada a fazer.
        }

        // 4. Executa o UPDATE no banco de dados
        await db.query(
            `UPDATE store_products 
             SET name = $1, price = $2, description = $3, stock_type = $4,
                 role_id_to_grant = $5, role_duration_days = $6, auto_created_role = $7
             WHERE id = $8 AND guild_id = $9`,
            [
                name, price, description, stockType,
                roleIdToUpdate, durationToUpdate, autoRoleToUpdate,
                productId, interaction.guild.id
            ]
        );

        await interaction.followUp({ content: '✅ Produto atualizado com sucesso!', ephemeral: true });
        
        // 5. Atualiza a vitrine (assíncrono)
        await updateStoreVitrine(interaction.client, interaction.guild.id);
    }
};