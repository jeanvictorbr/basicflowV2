const { ChannelType, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    // ESTA FUNÇÃO 'execute' É OBRIGATÓRIA AQUI
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;

        try {
            // Verifica configurações atuais para pegar o cargo de cliente
            const settings = (await db.query('SELECT store_client_role_id FROM guild_settings WHERE guild_id = $1', [guild.id])).rows[0];
            
            if (!settings?.store_client_role_id) {
                return interaction.editReply('⚠️ Você precisa configurar o **Cargo de Cliente** na Loja primeiro (use `/configurar` -> Loja) para que eu possa contar os clientes.');
            }

            // 1. Cria a Categoria no Topo
            const statsCategory = await guild.channels.create({
                name: '📊 ESTATÍSTICAS',
                type: ChannelType.GuildCategory,
                position: 0,
                permissionOverwrites: [
                    {
                        id: guild.id, // @everyone
                        deny: [PermissionsBitField.Flags.Connect], 
                        allow: [PermissionsBitField.Flags.ViewChannel] 
                    }
                ]
            });

            // 2. Cria Canal de Membros
            const memberCount = guild.memberCount;
            const membersChannel = await guild.channels.create({
                name: `👥 Membros: ${memberCount}`,
                type: ChannelType.GuildVoice,
                parent: statsCategory.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.Connect]
                    }
                ]
            });

            // 3. Cria Canal de Clientes
            const clientRole = guild.roles.cache.get(settings.store_client_role_id);
            const clientCount = clientRole ? clientRole.members.size : 0;

            const clientsChannel = await guild.channels.create({
                name: `💼 Clientes: ${clientCount}`,
                type: ChannelType.GuildVoice,
                parent: statsCategory.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.Connect]
                    }
                ]
            });

            // 4. Salva no Banco de Dados
            await db.query(
                `UPDATE guild_settings SET 
                    stats_enabled = true,
                    stats_category_id = $1,
                    stats_members_channel_id = $2,
                    stats_clients_channel_id = $3
                 WHERE guild_id = $4`,
                [statsCategory.id, membersChannel.id, clientsChannel.id, guild.id]
            );

            await interaction.editReply(`✅ **Sistema Configurado!**\n\nCanais criados:\n- <#${membersChannel.id}>\n- <#${clientsChannel.id}>\n\nℹ️ **Nota:** Os números serão atualizados automaticamente a cada 10 minutos.`);

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Erro ao criar canais de estatísticas. Verifique minhas permissões.');
        }
    }
};