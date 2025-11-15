const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');
const { importGuildBlueprint } = require('../../utils/guildBlueprintManager.js');

module.exports = {
    customId: 'architect_confirm_import_', 
    v2: V2_FLAG,
    /**
     * CORREÇÃO: Adicionado 'const client = interaction.client;'
     */
    execute: async (interaction, _client_arg) => {
        const client = interaction.client; // <-- ESTA É A CORREÇÃO
        const blueprintId = interaction.customId.split('_').pop();
        const guild = interaction.guild;
        const logChannel = interaction.channel; 

        await interaction.message.edit({
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 4,
                            label: 'Importação em Andamento...',
                            custom_id: 'import_disabled',
                            disabled: true
                        }
                    ]
                }
            ]
        });
        
        await interaction.reply({ content: 'Confirmado. Iniciando a importação... Este processo pode levar vários minutos.', flags: EPHEMERAL_FLAG });

        const { rows } = await db.query('SELECT * FROM guild_blueprints WHERE blueprint_id = $1', [blueprintId]);
        if (rows.length === 0) {
            return logChannel.send('❌ Erro: O blueprint não foi mais encontrado.');
        }
        
        // Agora o 'client' passado aqui está correto.
        importGuildBlueprint(guild, rows[0], logChannel, client);
    }
};