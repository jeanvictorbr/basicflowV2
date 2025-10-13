// handlers/selects/select_updates_channel.js
const { PermissionsBitField } = require('discord.js');
const db = require('../../database');
const generateUpdatesMenu = require('../../ui/updatesMenu');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_updates_channel',
    async execute(interaction) {
        await interaction.deferUpdate();
        const targetChannelId = interaction.values[0];
        const targetChannel = await interaction.guild.channels.cache.get(targetChannelId);

        if (!targetChannel) {
            return interaction.followUp({ content: '❌ Canal não encontrado.', flags: EPHEMERAL_FLAG });
        }

        const botPermissions = targetChannel.permissionsFor(interaction.guild.members.me);
        if (!botPermissions.has(PermissionsBitField.Flags.SendMessages) || !botPermissions.has(PermissionsBitField.Flags.ViewChannel)) {
             return interaction.followUp({ content: `❌ Eu não tenho permissão para 'Ver Canal' e 'Enviar Mensagens' em ${targetChannel}. Por favor, ajuste minhas permissões.`, flags: EPHEMERAL_FLAG });
        }
        
        try {
            await targetChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: false,
                AddReactions: false
            });
            await targetChannel.permissionOverwrites.edit(interaction.client.user.id, {
                SendMessages: true,
            });
        } catch (error) {
            console.error("Erro ao configurar permissões do canal de updates:", error);
            await interaction.followUp({ content: `⚠️ Não consegui configurar as permissões de "apenas leitura" em ${targetChannel}, mas o canal foi salvo. Recomendo que você ajuste manualmente.`, flags: EPHEMERAL_FLAG });
        }
        
        await db.query('UPDATE guild_settings SET updates_channel_id = $1 WHERE guild_id = $2', [targetChannelId, interaction.guild.id]);

        const menuComponents = await generateUpdatesMenu(interaction);

        await interaction.editReply({
            components: menuComponents,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
        
        await targetChannel.send({
            "embeds": [{
                "title": '🎉 Canal de Atualizações Configurado!',
                "description": `A partir de agora, todas as novidades sobre o **BasicFlow** serão enviadas aqui.\n\n*Configurado por ${interaction.user}*`,
                "color": 0x23a55a
            }]
        });
    }
};