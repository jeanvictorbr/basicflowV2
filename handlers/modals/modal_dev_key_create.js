// handlers/modals/modal_dev_key_create.js
const db = require('../../database.js');
const crypto = require('crypto');
const generateDevKeysMenu = require('../../ui/devPanel/devKeysMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

// Definimos o limite por página igual ao usado na navegação
const ITEMS_PER_PAGE = 5; 

module.exports = {
    customId: 'modal_dev_key_create_',
    async execute(interaction) {
        await interaction.deferUpdate(); 
        
        const encodedFeatures = interaction.customId.split('_')[4];
        const features = Buffer.from(encodedFeatures, 'base64').toString('utf8');

        const duration = parseInt(interaction.fields.getTextInputValue('input_duration'), 10);
        const uses = parseInt(interaction.fields.getTextInputValue('input_uses'), 10);
        const comment = interaction.fields.getTextInputValue('input_comment');

        if (isNaN(duration) || isNaN(uses) || duration <= 0 || uses <= 0) {
            return interaction.followUp({ content: '❌ Duração e Usos devem ser números maiores que zero.', ephemeral: true });
        }

        const key = `BF-${crypto.randomUUID().toUpperCase()}`;

        // Insere a nova chave
        await db.query(
            `INSERT INTO activation_keys (key, duration_days, uses_left, grants_features, comment)
             VALUES ($1, $2, $3, $4, $5)`,
            [key, duration, uses, features, comment]
        );

        // 1. Busca TODAS as chaves para ter o total e a ordenação correta
        const allKeysResult = await db.query('SELECT * FROM activation_keys WHERE uses_left > 0 ORDER BY key ASC');
        const allKeys = allKeysResult.rows;

        // 2. Aplica a PAGINAÇÃO (Pega apenas as primeiras 5 chaves)
        // Isso impede que o texto estoure o limite de 4000 caracteres
        const totalPages = Math.ceil(allKeys.length / ITEMS_PER_PAGE);
        const paginatedKeys = allKeys.slice(0, ITEMS_PER_PAGE);
        
        // 3. Gera o menu passando a fatia (paginatedKeys) e os totais
        await interaction.editReply({
            components: generateDevKeysMenu(paginatedKeys, 0, allKeys.length, totalPages),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });

        // Envia a mensagem de sucesso com a chave criada
        await interaction.followUp({ content: `✅ Chave criada com sucesso!\n\`\`\`${key}\`\`\``, ephemeral: true });
    }
};