// handlers/modals/modal_store_add_product.js
const db = require('../../database.js');
const generateProductsMenu = require('../../ui/store/productsMenu.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js');
const { logStoreAction } = require('../../utils/loggers/storeLog'); // <--- LOG IMPORTADO
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;
const { PermissionsBitField } = require('discord.js'); 

module.exports = {
    customId: 'modal_store_add_product',
    async execute(interaction) {
        await interaction.deferUpdate();

        const name = interaction.fields.getTextInputValue('input_name');
        const price = parseFloat(interaction.fields.getTextInputValue('input_price').replace(',', '.'));
        const description = interaction.fields.getTextInputValue('input_desc') || null;
        const stockType = interaction.fields.getTextInputValue('input_stock_type').toUpperCase();
        
        // --- LÓGICA DE CARGO (MANTIDA) ---
        const roleDurationInput = interaction.fields.getTextInputValue('input_role_duration') || null;
        let roleDuration = roleDurationInput ? parseInt(roleDurationInput, 10) : null;
        let newRoleId = null;
        let autoCreatedRole = false;
        
        if (isNaN(price)) {
            return interaction.followUp({ content: '❌ O preço deve ser um número válido.', ephemeral: true });
        }
        if (stockType !== 'REAL' && stockType !== 'GHOST') {
            return interaction.followUp({ content: '❌ Tipo de estoque inválido. Use "REAL" ou "GHOST".', ephemeral: true });
        }

        if (roleDuration) {
            if (isNaN(roleDuration) || roleDuration <= 0) {
                return interaction.followUp({ content: '❌ A duração do cargo deve ser um número positivo de dias.', ephemeral: true });
            }

            // Verifica permissão
            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return interaction.followUp({ content: '❌ Eu não tenho permissão para "Gerenciar Cargos". Não posso criar o cargo automático para este produto.', ephemeral: true });
            }

            try {
                // Cria o cargo
                const newRole = await interaction.guild.roles.create({
                    name: name, 
                    reason: `Cargo temporário para o produto: ${name} (StoreFlow)`
                });
                newRoleId = newRole.id;
                autoCreatedRole = true;
            } catch (error) {
                console.error("[Store] Erro ao criar cargo automático para produto:", error);
                return interaction.followUp({ content: '❌ Ocorreu um erro ao tentar criar o cargo no Discord.', ephemeral: true });
            }
        }
        // ----------------------------------

        const stockCount = stockType === 'REAL' ? 0 : -1;

        // Insere no banco
        await db.query(
            `INSERT INTO store_products (guild_id, name, price, description, stock_type, stock, role_id_to_grant, role_duration_days, auto_created_role) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [interaction.guild.id, name, price, description, stockType, stockCount, newRoleId, roleDuration, autoCreatedRole]
        );

        // --- LOG DE AUDITORIA ADICIONADO ---
        await logStoreAction(interaction.client, interaction.guild.id, 'CREATE', interaction.user, {
            name: `Produto: ${name}`,
            price: price,
            changes: `Estoque: ${stockType}${autoCreatedRole ? ` | Cargo Criado: Sim (${roleDuration} dias)` : ''}`
        });
        // -----------------------------------

        const products = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateProductsMenu(products, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
        
        await interaction.followUp({ content: '✅ Produto adicionado com sucesso!', ephemeral: true });
        await updateStoreVitrine(interaction.client, interaction.guild.id);
    }
};