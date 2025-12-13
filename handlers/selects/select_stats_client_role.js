// handlers/selects/select_stats_client_role.js
const { ChannelType, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'select_stats_client_role',
    async execute(interaction) {
        await interaction.deferUpdate();

        const guild = interaction.guild;
        const roleId = interaction.values[0]; // ID do cargo selecionado

        try {
            // 1. Salva o cargo de cliente nas configurações (atualiza se já existir)
            await db.query(
                `INSERT INTO guild_settings (guild_id, store_client_role_id) 
                 VALUES ($1, $2) 
                 ON CONFLICT (guild_id) 
                 DO UPDATE SET store_client_role_id = $2`,
                [guild.id, roleId]
            );

            // 2. Cria a Categoria no Topo
            const statsCategory = await guild.channels.create({
                name: '📊 ESTATÍSTICAS',
                type: ChannelType.GuildCategory,
                position: 0,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.Connect], // Ninguém conecta
                        allow: [PermissionsBitField.Flags.ViewChannel] // Todos veem
                    }
                ]
            });

            // 3. Cria Canal de Membros
            const memberCount = guild.memberCount;
            const membersChannel = await guild.channels.create({
                name: `👥 Membros: ${memberCount.toLocaleString('pt-BR')}`,
                type: ChannelType.GuildVoice,
                parent: statsCategory.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.Connect]
                    }
                ]
            });

            // 4. Cria Canal de Clientes (COM CORREÇÃO DE CACHE)
            // Forçamos o bot a ler todos os membros agora para garantir que o número não seja 0
            await guild.members.fetch(); 
            
            const role = guild.roles.cache.get(roleId);
            // Se o cargo existe, pega o tamanho. Se não, 0.
            const clientCount = role ? role.members.size : 0;

            const clientsChannel = await guild.channels.create({
                name: `💼 Clientes: ${clientCount.toLocaleString('pt-BR')}`,
                type: ChannelType.GuildVoice,
                parent: statsCategory.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.Connect]
                    }
                ]
            });

            // 5. Salva tudo no banco para o monitor atualizar depois
            await db.query(
                `UPDATE guild_settings SET 
                    stats_enabled = true,
                    stats_category_id = $1,
                    stats_members_channel_id = $2,
                    stats_clients_channel_id = $3
                 WHERE guild_id = $4`,
                [statsCategory.id, membersChannel.id, clientsChannel.id, guild.id]
            );

            // 6. Finaliza com mensagem de sucesso
            await interaction.editReply({
                content: `✅ **Pronto! Estatísticas Criadas.**\n\n🎯 **Cargo Monitorado:** <@&${roleId}>\n👥 **Membros:** ${memberCount}\n💼 **Clientes:** ${clientCount}\n\nℹ️ *O bot atualizará esses números automaticamente a cada 10 minutos.*`,
                components: [] // Remove o menu
            });

        } catch (error) {
            console.error('Erro ao criar stats:', error);
            await interaction.editReply({ 
                content: '❌ Erro ao criar os canais. Verifique se eu tenho permissão de **Gerenciar Canais** e **Ver Cargos**.', 
                components: [] 
            });
        }
    }
};