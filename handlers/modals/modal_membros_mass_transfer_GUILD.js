// Local: handlers/modals/modal_membros_mass_transfer_GUILD.js
const { EPHEMERAL_FLAG } = require('../../utils/constants');
const db = require('../../database');
const { decrypt } = require('../../utils/encryption');

module.exports = {
    customId: 'modal_membros_mass_transfer_GUILD',
    async execute(interaction) {
        await interaction.deferReply({ flags: EPHEMERAL_FLAG });

        // 1. Coletar dados do Modal
        const destGuildId = interaction.fields.getTextInputValue('dest_guild_id');
        const qtyInput = interaction.fields.getTextInputValue('quantity').trim().toUpperCase();

        // 2. Validar Guilda de Destino
        const guild = await interaction.client.guilds.fetch(destGuildId).catch(() => null);
        if (!guild) {
            return interaction.editReply('❌ Não consegui acessar o servidor de destino. Verifique o ID ou se estou nele.');
        }

        // 3. Validar Quantidade
        let limit = null;
        if (qtyInput !== 'ALL') {
            const parsedQty = parseInt(qtyInput);
            if (isNaN(parsedQty) || parsedQty <= 0) {
                return interaction.editReply('❌ Quantidade inválida. Use um número ou "ALL".');
            }
            limit = parsedQty;
        }

        await interaction.editReply(`🚀 **Preparando Transferência...**\n🎯 Alvo: **${guild.name}**\n🔄 Modo: Global (Puxando do banco de dados)`);

        try {
            // 4. Buscar Tokens no Banco (Lógica Global)
            // Pegamos tokens de qualquer servidor (global), priorizando o mais recente
            let query = `
                SELECT DISTINCT ON (user_id) user_id, access_token 
                FROM cloudflow_verified_users 
                WHERE access_token IS NOT NULL 
                ORDER BY user_id, verified_at DESC
            `;
            
            const queryParams = [];
            if (limit) {
                query += ' LIMIT $1';
                queryParams.push(limit);
            }

            const { rows: users } = await db.query(query, queryParams);

            if (users.length === 0) {
                return interaction.editReply('❌ Nenhum usuário com token encontrado no banco de dados.');
            }

            await interaction.editReply(`🚀 **Iniciando!**\n👥 Processando **${users.length}** usuários para **${guild.name}**...\n⏳ *Aguarde o relatório final...*`);

            let success = 0;
            let fail = 0;
            let alreadyIn = 0;

            // 5. Loop de Join
            for (const user of users) {
                try {
                    // Check rápido de cache
                    if (guild.members.cache.has(user.user_id)) {
                        alreadyIn++;
                        continue;
                    }

                    const token = decrypt(user.access_token);
                    if (!token) {
                        fail++; 
                        continue;
                    }

                    await guild.members.add(user.user_id, { accessToken: token });
                    success++;
                    
                    // Delay de segurança (1.2s) para evitar rate-limit
                    await new Promise(r => setTimeout(r, 1200));

                } catch (err) {
                    // Ignora erros se o user já estiver lá ou token inválido
                    fail++;
                }
            }

            await interaction.followUp({
                content: `✅ **Transferência Finalizada!**\n\n🎯 Servidor: **${guild.name}**\n📊 Resultados:\n✅ Entraram: **${success}**\n⚠️ Já estavam: **${alreadyIn}**\n❌ Falhas/Expirados: **${fail}**`,
                flags: EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error('[Mass Transfer] Erro Fatal:', error);
            await interaction.editReply('❌ Ocorreu um erro interno ao processar a transferência.');
        }
    },
};