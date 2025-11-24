// Substitua em: handlers/modals/store_edit_sub_.js
const db = require('../../database.js');
const generateEditProductSelectMenu = require('../../ui/store/editProductSelectMenu.js');
const generateCategoryProductSelect = require('../../ui/store/categoryProductSelect.js'); // <--- IMPORTANTE
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js');
const { PermissionsBitField } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_edit_sub_',
    async execute(interaction) {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        // Parse do ID para ver se tem contexto de categoria
        // Ex: 'store_edit_sub_123' OU 'store_edit_sub_123_cat_5'
        const rawId = interaction.customId.replace('store_edit_sub_', '');
        let productId = rawId;
        let returnToCategoryId = null;

        if (rawId.includes('_cat_')) {
            const parts = rawId.split('_cat_');
            productId = parts[0];
            returnToCategoryId = parts[1];
        }

        // --- (Lógica de Edição / Banco de Dados permanece IDÊNTICA) ---
        const name = interaction.fields.getTextInputValue('name');
        let price = interaction.fields.getTextInputValue('price').replace(',', '.');
        const description = interaction.fields.getTextInputValue('description');
        const stockTypeInput = interaction.fields.getTextInputValue('stock_type').toUpperCase();
        const roleDurationInput = interaction.fields.getTextInputValue('role_duration');

        if (isNaN(price)) price = 0;
        let roleDuration = parseInt(roleDurationInput);
        if (isNaN(roleDuration)) roleDuration = 0;

        let stockType = 'GHOST';
        if (stockTypeInput.includes('REAL')) stockType = 'REAL';

        try {
            const currentProduct = (await db.query('SELECT * FROM store_products WHERE id = $1', [productId])).rows[0];
            if (!currentProduct) return interaction.followUp({ content: '❌ Produto não encontrado.', ephemeral: true });

            let newStockCount = currentProduct.stock;
            if (stockType === 'GHOST') newStockCount = -1;
            else if (stockType === 'REAL' && currentProduct.stock === -1) newStockCount = 0;

            // Lógica de Cargo (Resumida para manter o foco na navegação)
            let roleIdToGrant = currentProduct.role_id_to_grant;
            let autoCreatedRole = currentProduct.auto_created_role;

            if (roleDuration > 0) {
                if (interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                    let needsNewRole = !roleIdToGrant;
                    if (roleIdToGrant) {
                        const existingRole = await interaction.guild.roles.fetch(roleIdToGrant).catch(() => null);
                        if (!existingRole) needsNewRole = true;
                        else if (existingRole.name !== name && autoCreatedRole) await existingRole.setName(name).catch(() => {});
                    }
                    if (needsNewRole) {
                        const newRole = await interaction.guild.roles.create({ name: name, reason: `StoreFlow` });
                        roleIdToGrant = newRole.id;
                        autoCreatedRole = true;
                    }
                }
            } else {
                roleIdToGrant = null;
                roleDuration = null;
            }

            // Update DB
            await db.query(
                `UPDATE store_products 
                 SET name=$1, price=$2, description=$3, stock_type=$4, stock=$5, role_duration_days=$6, role_id_to_grant=$7, auto_created_role=$8
                 WHERE id=$9 AND guild_id=$10`,
                [name, price, description, stockType, newStockCount, roleDuration, roleIdToGrant, autoCreatedRole, productId, interaction.guild.id]
            );

            await updateStoreVitrine(interaction.client, interaction.guild.id);

            // --- AQUI ESTÁ A MÁGICA DO RETORNO ---
            const ITEMS_PER_PAGE = 25;
            let uiComponents;

            if (returnToCategoryId) {
                // VOLTAR PARA O MENU DA CATEGORIA
                const countRes = await db.query('SELECT COUNT(*) FROM store_products WHERE category_id = $1', [returnToCategoryId]);
                const totalItems = parseInt(countRes.rows[0].count);
                let totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

                const products = (await db.query(
                    'SELECT id, name, price FROM store_products WHERE category_id = $1 ORDER BY id ASC LIMIT $2 OFFSET 0', 
                    [returnToCategoryId, ITEMS_PER_PAGE]
                )).rows;

                // Gera o menu usando a função de categoria, passando o ID dela e o modo 'edit'
                uiComponents = generateCategoryProductSelect(products, 0, totalPages, 'edit', returnToCategoryId);

            } else {
                // VOLTAR PARA O MENU GERAL (Comportamento antigo)
                const countResult = await db.query('SELECT COUNT(*) as count FROM store_products WHERE guild_id = $1', [interaction.guild.id]);
                let totalPages = Math.ceil(parseInt(countResult.rows[0].count) / ITEMS_PER_PAGE) || 1;

                const products = (await db.query(
                    'SELECT id, name, price FROM store_products WHERE guild_id = $1 ORDER BY id ASC LIMIT $2 OFFSET 0', 
                    [interaction.guild.id, ITEMS_PER_PAGE]
                )).rows;

                uiComponents = generateEditProductSelectMenu(products, 0, totalPages, false);
            }

            // Feedback no topo
            if (uiComponents[0]?.components?.[0]) {
                const oldContent = uiComponents[0].components[0].content;
                uiComponents[0].components[0].content = `> ✅ **Salvo!** ${name}\n` + oldContent;
            }

            await interaction.editReply({
                components: uiComponents,
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error("Erro edição:", error);
            await interaction.followUp({ content: '❌ Erro ao salvar.', ephemeral: true });
        }
    }
};