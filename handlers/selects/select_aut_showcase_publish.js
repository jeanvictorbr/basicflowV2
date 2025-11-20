// File: handlers/selects/select_aut_showcase_publish.js
// (CORRIGIDO: Agora injeta o guild_id para o botão funcionar)

const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { getCloudflowVerifyShowcaseMenu } = require('../../ui/automations/cloudflowVerifyShowcaseMenu.js');

// 1. Importa AMBOS os geradores de UI
const { getCloudflowVerifyShowcaseEmbed } = require('../../ui/automations/cloudflowVerifyShowcaseEmbed.js'); // V2 (sem imagem)
const { getCloudflowVerifyShowcaseEmbed_Legacy } = require('../../ui/automations/cloudflowVerifyShowcaseEmbed_Legacy.js'); // Legado (com imagem)

const { PermissionsBitField } = require('discord.js');

module.exports = {
    customId: 'select_aut_showcase_publish',
    async execute(interaction) {
        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });
        const channelId = interaction.values[0];
        const channel = await interaction.guild.channels.cache.get(channelId);

        if (!channel) {
            return interaction.followUp({ content: '❌ Canal não encontrado.', flags: EPHEMERAL_FLAG });
        }
        
        const me = await interaction.guild.members.fetch(interaction.client.user.id);
        if (!channel.permissionsFor(me).has(PermissionsBitField.Flags.SendMessages) || 
            !channel.permissionsFor(me).has(PermissionsBitField.Flags.ViewChannel)) {
             return interaction.followUp({ content: '❌ Eu não tenho permissão para ver ou enviar mensagens nesse canal.', flags: EPHEMERAL_FLAG });
        }

        try {
            const settings = await db.getGuildSettings(interaction.guild.id);
            const config = settings.cloudflow_verify_config || {};
            
            // ============================================================
            // ⬇️ CORREÇÃO CRÍTICA AQUI ⬇️
            // Adiciona o ID da guilda na configuração antes de gerar a vitrine
            // ============================================================
            const finalConfig = {
                ...config,
                guild_id: interaction.guild.id
            };

            const imageUrl = config?.image || null;
            
            let showcaseMessage;
            let sentMessage;

            // 2. LÓGICA IF/ELSE
            if (imageUrl) {
                // --- CONDIÇÃO 1: TEM IMAGEM (Legado) ---
                // Passamos finalConfig para garantir que se o legado usar botão, tenha o ID
                showcaseMessage = getCloudflowVerifyShowcaseEmbed_Legacy(finalConfig);
                sentMessage = await channel.send(showcaseMessage);
                await interaction.followUp({ content: `✅ Vitrine (com imagem) publicada com sucesso em ${channel}!`, flags: EPHEMERAL_FLAG });

            } else {
                // --- CONDIÇÃO 2: SEM IMAGEM (V2 / Home) ---
                // Aqui é essencial passar o finalConfig para o botão de LINK funcionar
                showcaseMessage = getCloudflowVerifyShowcaseEmbed(finalConfig);
                sentMessage = await channel.send(showcaseMessage);
                await interaction.followUp({ content: `✅ Vitrine (V2) publicada com sucesso em ${channel}!`, flags: EPHEMERAL_FLAG });
            }

            // 3. Salva os IDs no banco
            await db.query(
                `INSERT INTO guild_settings (guild_id, cloudflow_verify_channel_id, cloudflow_verify_message_id)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (guild_id) DO UPDATE SET
                   cloudflow_verify_channel_id = $2,
                   cloudflow_verify_message_id = $3`,
                [interaction.guild.id, channelId, sentMessage.id]
            );

            // 4. Recarrega o painel
            const newSettings = await db.getGuildSettings(interaction.guild.id);
            const menu = getCloudflowVerifyShowcaseMenu(newSettings || {});
            await interaction.editReply(menu);

        } catch (error) {
            console.error("Erro ao publicar vitrine:", error);
            await interaction.followUp({ content: '❌ Ocorreu um erro ao tentar publicar a mensagem.', flags: EPHEMERAL_FLAG });
        }
    }
};