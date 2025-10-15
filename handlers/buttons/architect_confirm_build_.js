// Substitua o conteúdo em: handlers/buttons/architect_confirm_build_.js
const { ChannelType, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    customId: 'architect_confirm_build_',
    async execute(interaction) {
        let logChannel;

        try {
            // Criação do canal de log (código inalterado)
            logChannel = await interaction.guild.channels.create({
                name: `arquiteto-log-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.client.user.id, allow: [PermissionsBitField.Flags.ViewChannel] }
                ],
            });
            await interaction.update({ content: `🏗️ Construção iniciada! Acompanhe o progresso em ${logChannel}.`, components: [], embeds: [] });

            // Busca do plano (código inalterado)
            const sessionId = interaction.customId.replace('architect_confirm_build_', '');
            const sessionResult = await db.query('SELECT blueprint FROM architect_sessions WHERE channel_id = $1', [sessionId]);
            if (!sessionResult.rows[0]?.blueprint) {
                return await logChannel.send('❌ Erro crítico: Não foi possível encontrar o plano de construção.');
            }
            const blueprint = sessionResult.rows[0].blueprint;
            
            // Limpeza do servidor (código inalterado)
            await logChannel.send('🧹 **Passo 1/4:** Limpando o servidor...');
            for (const channel of interaction.guild.channels.cache.values()) {
                if (channel.id !== logChannel.id) await channel.delete().catch(() => {});
            }
            for (const role of interaction.guild.roles.cache.values()) {
                if (!role.managed && role.name !== '@everyone' && role.position < interaction.guild.members.me.roles.highest.position) await role.delete().catch(() => {});
            }
            await logChannel.send('✅ Limpeza concluída.');

            // Criação de cargos (código inalterado)
            await logChannel.send('👑 **Passo 2/4:** Criando cargos...');
            let memberRole, staffRole;
            const everyoneRole = interaction.guild.roles.everyone;
            for (const roleConfig of blueprint.roles) {
                let permissions = [];
                const roleNameLower = roleConfig.name.toLowerCase();
                if (roleConfig.permissions === 'Admin') permissions.push(PermissionsBitField.Flags.Administrator);
                if (roleConfig.permissions === 'Moderação') permissions.push(PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.ManageMessages);
                const newRole = await interaction.guild.roles.create({ name: roleConfig.name, permissions: permissions });
                if (roleNameLower.includes('membro')) memberRole = newRole;
                if (roleNameLower.includes('staff') || roleNameLower.includes('mod')) staffRole = newRole;
                await delay(300);
            }
            await logChannel.send('✅ Cargos criados.');
            if (memberRole) await interaction.member.roles.add(memberRole).catch(console.error);

            // --- LÓGICA DE PERMISSÕES TOTALMENTE REESCRITA ---
            await logChannel.send('📂 **Passo 3/4:** Criando estrutura com permissões seguras...');
            for (const categoryConfig of blueprint.categories) {
                const category = await interaction.guild.channels.create({
                    name: categoryConfig.name,
                    type: ChannelType.GuildCategory,
                    // Permissões são definidas DIRETAMENTE no canal, não aqui.
                });
                await delay(500);

                for (const channelConfig of categoryConfig.channels) {
                    const channelPermissions = [
                        // BASE: O Bot e a Staff sempre podem ver e gerir.
                        { id: interaction.client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels] },
                    ];
                    if (staffRole) {
                        channelPermissions.push({ id: staffRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] });
                    }

                    switch (channelConfig.purpose) {
                        case 'welcome':
                            // Público: @everyone PODE VER. @everyone NÃO PODE escrever (a menos que seja um canal de verificação).
                            channelPermissions.push({ 
                                id: everyoneRole.id, 
                                allow: [PermissionsBitField.Flags.ViewChannel],
                                deny: [PermissionsBitField.Flags.SendMessages]
                            });
                            // Se for o canal de verificação, sobrescrevemos para permitir a escrita.
                            if (channelConfig.name.toLowerCase().includes('verificar')) {
                                const perm = channelPermissions.find(p => p.id === everyoneRole.id);
                                if (perm) {
                                    perm.allow.push(PermissionsBitField.Flags.SendMessages);
                                }
                            }
                            break;
                        
                        case 'chat':
                            // Privado para Membros: @everyone NÃO PODE VER. Membros PODEM VER e ESCREVER.
                            channelPermissions.push({ id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] });
                            if (memberRole) {
                                channelPermissions.push({ id: memberRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] });
                            }
                            break;

                        case 'readonly':
                        default:
                             // Privado e Somente Leitura: @everyone NÃO PODE VER. Membros PODEM VER mas NÃO PODEM ESCREVER.
                            channelPermissions.push({ id: everyoneRole.id, deny: [PermissionsBitField.Flags.ViewChannel] });
                             if (memberRole) {
                                channelPermissions.push({ id: memberRole.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] });
                            }
                            break;
                    }
                    
                    await interaction.guild.channels.create({
                        name: channelConfig.name,
                        type: channelConfig.type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText,
                        parent: category.id,
                        permissionOverwrites: channelPermissions
                    });
                    await delay(500);
                }
            }
            await logChannel.send('✅ Estrutura e permissões aplicadas.');
            
            // Finalização... (código inalterado)
            await logChannel.send('🏁 **Passo 4/4:** Finalizando...');
            const originalChannel = await interaction.guild.channels.fetch(sessionId).catch(() => null);
            if (originalChannel) await originalChannel.delete().catch(console.error);
            await db.query('DELETE FROM architect_sessions WHERE channel_id = $1', [sessionId]);
            await logChannel.send('🎉 **Construção Concluída!** Seu servidor está pronto. Este canal de logs será apagado em 30 segundos.');
            setTimeout(() => { logChannel.delete().catch(console.error); }, 30000);

        } catch (error) {
            console.error("[Arquiteto Build] Erro:", error);
            const errorMessage = '❌ Ocorreu um erro crítico durante a construção. Verifique se eu tenho a permissão de **Administrador** e tente novamente.';
            if (logChannel) await logChannel.send(errorMessage);
            else await interaction.followUp({ content: errorMessage, ephemeral: true });
        }
    }
};