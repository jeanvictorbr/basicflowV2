const { ChannelType, PermissionFlagsBits } = require('discord.js');
const db = require('../database.js');
const getVoicePanel = require('../ui/voiceControlPanel.js');

module.exports = async (oldState, newState, client) => {
    // 1. Lógica de ENTRAR no canal (Criar Sala)
    if (newState.channelId && (!oldState.channelId || oldState.channelId !== newState.channelId)) {
        const hubConfig = await db.query(`SELECT * FROM voice_hubs WHERE trigger_channel_id = $1`, [newState.channelId]);
        
        if (hubConfig.rows.length > 0) {
            const config = hubConfig.rows[0];
            const guild = newState.guild;
            const member = newState.member;

            try {
                let parentCategory = newState.channel.parent;
                if (config.category_id) {
                    try {
                        parentCategory = await guild.channels.fetch(config.category_id);
                    } catch (e) {}
                }
                
                const voiceChannel = await guild.channels.create({
                    name: `Sala de ${member.user.username}`,
                    type: ChannelType.GuildVoice,
                    parent: parentCategory,
                    permissionOverwrites: [
                        {
                            id: member.id,
                            allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers, PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: guild.id,
                            allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: client.user.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.Connect, PermissionFlagsBits.ManageChannels],
                        }
                    ],
                });

                if (member.voice.channel) {
                    await member.voice.setChannel(voiceChannel);
                }

                await db.query(`
                    INSERT INTO temp_voices (channel_id, guild_id, owner_id)
                    VALUES ($1, $2, $3)
                `, [voiceChannel.id, guild.id, member.id]);

                const panelJSON = getVoicePanel({
                    channelName: voiceChannel.name,
                    channelId: voiceChannel.id,
                    ownerId: member.id,
                    isLocked: false,
                    isHidden: false,
                    userLimit: 0
                });

                // --- MENSAGEM COM O AVISO SOLICITADO ---
                const greetingComponent = {
                    type: 10,
                    content: `👋 Olá <@${member.id}>, configure sua sala abaixo:\n⚠️ **Aviso:** Se o dono sair, a sala será excluída automaticamente!`,
                    style: 1
                };

                const finalComponents = [greetingComponent, ...panelJSON.components];

                setTimeout(async () => {
                    try {
                        const targetChannel = await guild.channels.fetch(voiceChannel.id).catch(() => null);
                        if (targetChannel) {
                            await targetChannel.send({ 
                                flags: (1 << 15), 
                                components: finalComponents 
                            });
                        }
                    } catch (sendError) {
                        console.error("Erro ao enviar painel na sala temporária:", sendError);
                    }
                }, 2000); 

            } catch (err) {
                console.error("Erro Crítico ao criar sala temporária:", err);
            }
        }
    }

    // 2. Lógica de SAIR do canal (Deletar se vazio)
    if (oldState.channelId && (!newState.channelId || newState.channelId !== oldState.channelId)) {
        try {
            const tempChannelCheck = await db.query(`SELECT * FROM temp_voices WHERE channel_id = $1`, [oldState.channelId]);
            
            if (tempChannelCheck.rows.length > 0) {
                const channel = oldState.channel;
                if (channel && channel.members.size === 0) {
                    try {
                        await channel.delete();
                        await db.query(`DELETE FROM temp_voices WHERE channel_id = $1`, [oldState.channelId]);
                    } catch (err) {}
                }
            }
        } catch (dbError) {
            console.error("Erro ao verificar saída de canal:", dbError);
        }
    }
};