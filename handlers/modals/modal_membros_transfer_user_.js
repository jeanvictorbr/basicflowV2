// Local: handlers/modals/modal_membros_transfer_user_.js
const { EPHEMERAL_FLAG } = require('../../utils/constants');
const db = require('../../database');
const { decrypt } = require('../../utils/encryption'); // Importa nossa nova criptografia segura

module.exports = {
    customId: 'modal_membros_transfer_user_',
    async execute(interaction) {
        await interaction.deferReply({ flags: EPHEMERAL_FLAG });

        // 1. Recuperar IDs
        const targetUserId = interaction.customId.split('_').pop();
        const targetGuildId = interaction.fields.getTextInputValue('target_guild_id');

        try {
            // 2. Verificar se o bot está no servidor de destino
            const guild = await interaction.client.guilds.fetch(targetGuildId).catch(() => null);
            if (!guild) {
                return interaction.editReply(`❌ **Erro:** Eu não estou no servidor com ID \`${targetGuildId}\`.\nAdicione-me lá primeiro.`);
            }

            // 3. Verificar se o usuário já está lá
            try {
                const member = await guild.members.fetch(targetUserId).catch(() => null);
                if (member) {
                    return interaction.editReply(`⚠️ O usuário <@${targetUserId}> já está no servidor **${guild.name}**.`);
                }
            } catch (e) {}

            // 4. Buscar Token no Banco de Dados
            // Pegamos o access_token mais recente
            const result = await db.query(
                'SELECT access_token FROM cloudflow_verified_users WHERE user_id = $1 ORDER BY verified_at DESC LIMIT 1',
                [targetUserId]
            );

            if (result.rows.length === 0) {
                return interaction.editReply(`❌ **Erro:** O usuário <@${targetUserId}> não possui verificação CloudFlow ativa.`);
            }

            const encryptedToken = result.rows[0].access_token;

            // 5. Descriptografar
            const accessToken = decrypt(encryptedToken);
            if (!accessToken) {
                return interaction.editReply('❌ **Erro Interno:** Falha ao descriptografar o token. (Chave incorreta ou token antigo)');
            }

            // 6. EXECUTAR O JOIN (PUXAR)
            await guild.members.add(targetUserId, {
                accessToken: accessToken
            });

            await interaction.editReply(`✅ **Sucesso!** O usuário <@${targetUserId}> foi puxado para o servidor **${guild.name}**.`);

        } catch (error) {
            console.error('[CloudFlow Transfer] Erro:', error);

            // Tratamento de erros específicos do Discord
            if (error.code === 50013) {
                return interaction.editReply('❌ **Sem Permissão:** Verifique se meu cargo no servidor de destino tem permissão de "Criar Convite" e "Gerenciar Apelidos/Cargos".');
            }
            if (error.code === 30001) {
                return interaction.editReply('❌ **Limite:** O usuário atingiu o limite máximo de servidores (100/200).');
            }
            if (error.status === 403) { // Token inválido
                return interaction.editReply('❌ **Token Expirado:** O usuário revogou o acesso ou o token venceu. Ele precisa se verificar novamente.');
            }

            return interaction.editReply(`❌ **Erro Desconhecido:** \`${error.message}\``);
        }
    },
};