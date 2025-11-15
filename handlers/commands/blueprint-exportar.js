const { ChannelType, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');
const { exportGuildBlueprint } = require('../../utils/guildBlueprintManager.js');

module.exports = {
    data: {
        name: 'blueprint-exportar'
    },
    v2: V2_FLAG,
    devOnly: true, 
    /**
     * CORREÇÃO: Adicionado 'const client = interaction.client;'
     * para garantir que o objeto client esteja definido.
     */
    execute: async (interaction, _client_arg) => { // Renomeamos o argumento para evitar conflito
        const client = interaction.client; // <-- ESTA É A CORREÇÃO

        const templateName = interaction.options.getString('nome');
        const guild = interaction.guild;
        const user = interaction.user; 

        const check = await db.query('SELECT 1 FROM guild_blueprints WHERE created_by = $1 AND template_name = $2', [user.id, templateName]);
        if (check.rows.length > 0) {
            return interaction.reply({
                content: '❌ Você já possui um blueprint salvo com este nome. Por favor, escolha outro nome.',
                flags: EPHEMERAL_FLAG
            });
        }

        let logChannel;
        try {
            logChannel = await guild.channels.create({
                name: `log-export-${templateName.replace(/\s+/g, '-').substring(0, 20)}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.id, 
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: client.user.id, // Agora 'client' está 100% definido
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });
        } catch (e) {
            console.error('Falha ao criar canal de log para exportação:', e);
            return interaction.reply({
                content: `❌ Falha ao criar o canal de log. Verifique minhas permissões de "Gerenciar Canais".\nErro: ${e.message}`,
                flags: EPHEMERAL_FLAG
            });
        }

        await interaction.reply({
            content: `🚀 Exportação iniciada! O progresso será registrado no canal: <#${logChannel.id}>`,
            flags: EPHEMERAL_FLAG
        });

        exportGuildBlueprint(guild, user.id, templateName, logChannel);
    }
};