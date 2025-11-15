const { ChannelType, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'architect_select_import',
    v2: V2_FLAG, // <-- ISTO FICA AQUI (para o index.js)
    execute: async (interaction, _client_arg) => {
        const client = interaction.client; 
        const blueprintId = interaction.values[0];
        const guild = interaction.guild;
        const user = interaction.user;

        const { rows } = await db.query('SELECT * FROM guild_blueprints WHERE blueprint_id = $1 AND created_by = $2', [blueprintId, user.id]);
        if (rows.length === 0) {
            return interaction.reply({
                content: '❌ Blueprint não encontrado ou você não tem permissão para usá-lo.',
                flags: EPHEMERAL_FLAG // <-- CORRETO
            });
        }
        const blueprint = rows[0];

        let logChannel;
        try {
            logChannel = await guild.channels.create({
                name: `log-import-${blueprint.template_name.replace(/\s+/g, '-').substring(0, 20)}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
                ],
            });
        } catch (e) {
            return interaction.reply({
                content: '❌ Falha ao criar o canal de log. Verifique minhas permissões de "Gerenciar Canais".',
                flags: EPHEMERAL_FLAG // <-- CORRETO
            });
        }

        // Esta mensagem não é efêmera, então não precisa de flags
        await logChannel.send({
            content: `**⚠️ AVISO DE DESTRUIÇÃO ⚠️**\n\nVocê está prestes a importar o blueprint **${blueprint.template_name}** para este servidor.\n\n**ISTO IRÁ APAGAR TODOS OS CANAIS E CARGOS EXISTENTES (que estão abaixo de mim) E SUBSTITUÍ-LOS PELO BLUEPRINT.**\n\nEsta ação é **irreversível**. Prossiga com extrema cautela.\n\nClique no botão abaixo para confirmar a importação.`,
            components: [
                {
                    type: 1, 
                    components: [
                        {
                            type: 2, 
                            style: 4, 
                            label: 'Confirmar e Destruir Arquitetura Atual',
                            custom_id: `architect_confirm_import_${blueprintId}`
                        },
                        {
                            type: 2, 
                            style: 2, 
                            label: 'Cancelar',
                            custom_id: 'delete_ephemeral_reply' 
                        }
                    ]
                }
            ]
        });

        return interaction.reply({
            content: `Atenção! Uma confirmação final é necessária. Por favor, vá para o canal <#${logChannel.id}> para continuar.`,
            /**
             * CORREÇÃO: Removido o 'V2_FLAG' daqui.
             */
            flags: EPHEMERAL_FLAG
        });
    }
};