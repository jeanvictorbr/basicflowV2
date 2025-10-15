// Crie em: handlers/buttons/architect_confirm_add_.js
const { ChannelType, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
    customId: 'architect_confirm_add_',
    async execute(interaction) {
        await interaction.update({ content: '⚠️ **INICIANDO ADIÇÃO DE ESTRUTURAS!** Este processo pode levar alguns momentos.', components: [], embeds: [] });
        const logChannel = interaction.channel; // A conversa já é o nosso canal de log

        try {
            const sessionId = interaction.customId.replace('architect_confirm_add_', '');
            const sessionResult = await db.query('SELECT blueprint FROM architect_sessions WHERE channel_id = $1', [sessionId]);

            if (!sessionResult.rows[0] || !sessionResult.rows[0].blueprint) {
                return await logChannel.send('❌ Erro crítico: Não foi possível encontrar o plano de adição. A operação foi cancelada.');
            }
            const blueprint = sessionResult.rows[0].blueprint;
            
            // --- INÍCIO DA ADIÇÃO (SEM LIMPEZA) ---

            // 1. Criar cargos (se houver)
            if (blueprint.roles && blueprint.roles.length > 0) {
                await logChannel.send('👑 **Passo 1/2:** Criando novos cargos...');
                for (const roleConfig of blueprint.roles.reverse()) {
                    let permissions = [];
                    if (roleConfig.permissions === 'Admin') permissions.push(PermissionsBitField.Flags.Administrator);
                    if (roleConfig.permissions === 'Moderação') permissions.push(PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.ManageMessages);
                    await interaction.guild.roles.create({ name: roleConfig.name, permissions: permissions });
                    await delay(500);
                }
                await logChannel.send('✅ Novos cargos criados.');
            }

            // 2. Criar categorias e canais (se houver)
            if (blueprint.categories && blueprint.categories.length > 0) {
                await logChannel.send('📂 **Passo 2/2:** Criando novas categorias e canais...');
                for (const categoryConfig of blueprint.categories) {
                    const category = await interaction.guild.channels.create({
                        name: categoryConfig.name,
                        type: ChannelType.GuildCategory,
                    });
                    await delay(500);

                    for (const channelConfig of categoryConfig.channels) {
                        await interaction.guild.channels.create({
                            name: channelConfig.name,
                            type: channelConfig.type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText,
                            parent: category.id,
                        });
                        await delay(500);
                    }
                }
                await logChannel.send('✅ Novas categorias e canais criados.');
            }
            
            // 3. Finalização
            await db.query('DELETE FROM architect_sessions WHERE channel_id = $1', [sessionId]);
            
            await logChannel.send('🎉 **Operação Concluída!** As novas estruturas foram adicionadas ao seu servidor. Este canal será apagado em 30 segundos.');
            
            setTimeout(() => {
                logChannel.delete('Consultoria concluída.').catch(console.error);
            }, 30000);

        } catch (error) {
            console.error("[Arquiteto Adicionar] Erro:", error);
            await logChannel.send('❌ Ocorreu um erro crítico durante a adição. Verifique se tenho as permissões necessárias. A equipe de desenvolvimento foi notificada.');
        }
    }
};