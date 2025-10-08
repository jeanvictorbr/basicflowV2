// handlers/selects/select_dev_key_revoke.js
const db = require('../../database.js');
const generateDevKeysMenu = require('../../ui/devPanel/devKeysMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_dev_key_revoke',
    async execute(interaction) {
        // Atualiza a mensagem que contém o menu de seleção
        await interaction.deferUpdate(); 
        const key = interaction.values[0];

        await db.query('DELETE FROM activation_keys WHERE key = $1', [key]);

        // Busca a lista atualizada e redesenha o menu principal na mesma mensagem
        const updatedKeys = (await db.query('SELECT * FROM activation_keys ORDER BY key ASC')).rows;
        await interaction.editReply({
            components: generateDevKeysMenu(updatedKeys, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
        
        // Envia uma confirmação separada e efêmera
        await interaction.followUp({ content: `✅ Chave \`${key}\` revogada com sucesso!`, ephemeral: true });
    }
};