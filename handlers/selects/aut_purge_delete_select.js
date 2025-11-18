// Local: handlers/selects/aut_purge_delete_select.js
const db = require('../../database');
const { getPurgeMenu } = require('../../ui/automations/purgeMenu');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'aut_purge_delete_select',
    async execute(interaction) {
        const channelToDelete = interaction.values[0];

        // Deleta do banco
        await db.query(
            'DELETE FROM guild_aut_purge WHERE guild_id = $1 AND channel_id = $2',
            [interaction.guild.id, channelToDelete]
        );

        // Busca lista atualizada
        const result = await db.query(
            'SELECT * FROM guild_aut_purge WHERE guild_id = $1 ORDER BY channel_id',
            [interaction.guild.id]
        );

        // Gera o menu base
        const payload = getPurgeMenu(result.rows);
        
        // --- CORREÇÃO DO ERRO 50035 ---
        // Inserimos a mensagem de sucesso como um componente de texto (Type 10)
        // dentro da estrutura V2, logo após o título.
        const successMessage = {
            type: 10,
            content: `✅ **Sucesso:** A automação para o canal <#${channelToDelete}> foi removida.`
        };

        // Inserir na posição 2 (logo após o título/descrição padrão)
        if (payload.components[0] && payload.components[0].components) {
            payload.components[0].components.splice(2, 0, successMessage);
        }

        await interaction.update(payload);
    },
};