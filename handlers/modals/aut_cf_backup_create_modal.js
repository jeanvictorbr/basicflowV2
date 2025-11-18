// handlers/modals/aut_cf_backup_create_modal.js
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');
const db = require('../../database');
const bcrypt = require('bcrypt');
const guildBlueprintManager = require('../../utils/guildBlueprintManager');
const { buildCloudFlowBackupsMenu } = require('../../ui/automations/cloudflowBackupsMenu');

module.exports = {
    customId: 'aut_cf_backup_create_modal',
    async execute(interaction) {
        
        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });

        const backupName = interaction.fields.getTextInputValue('backup_name');
        const password = interaction.fields.getTextInputValue('backup_password');
        
        const guild = interaction.guild;
        const user = interaction.user;

        try {
            await interaction.followUp({
                content: 'Iniciando processo de backup... Isso pode levar alguns minutos. Estou analisando a estrutura do servidor...',
                flags: EPHEMERAL_FLAG
            });

            const backupData = await guildBlueprintManager.exportGuildBlueprint(
                guild, 
                user.id, 
                backupName, 
                null
            );

            if (!backupData) {
                return await interaction.followUp({
                    content: '❌ Erro! Não foi possível gerar a estrutura do servidor. Tente novamente.',
                    flags: EPHEMERAL_FLAG
                });
            }

            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            const createdAt = Date.now().toString();
            const query = `
                INSERT INTO cloudflow_backups (guild_id, user_id, backup_name, password_hash, created_at, backup_data)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING backup_id;
            `;
            const { rows } = await db.query(query, [
                guild.id, 
                user.id, 
                backupName, 
                passwordHash, 
                createdAt, 
                JSON.stringify(backupData) 
            ]);

            const newBackupId = rows[0].backup_id;

            // --- INÍCIO DA CORREÇÃO DA REGRA DE NEGÓCIO ---
            // 5. Envia DM para o usuário com os detalhes
            try {
                await user.send({
                    content: `## ☁️ Backup CloudFlow Criado com Sucesso!\n\n` +
                             `Você criou um novo backup de estrutura do servidor **${guild.name}**.\n\n` +
                             `**Nome do Backup:** ${backupName}\n` +
                             `**ID do Backup:** \`${newBackupId}\`\n\n` +
                             `**SENHA (GUARDE BEM):** ||${password}||\n\n` +
                             `**Aviso:** Você pode usar este ID e Senha para restaurar este backup em **qualquer servidor** que possua o BasicFlow.`
                });
            } catch (dmError) {
            // --- FIM DA CORREÇÃO ---
                await interaction.followUp({
                    content: '⚠️ Não foi possível enviar a DM com a senha. Verifique suas configurações de privacidade. **Anote sua senha, ela não pode ser recuperada!**',
                    flags: EPHEMERAL_FLAG
                });
            }

            // 6. Atualiza o dashboard de backups
            const menu = await buildCloudFlowBackupsMenu(interaction);
            await interaction.editReply({
                ...menu[0],
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

            return await interaction.followUp({
                content: `✅ Backup \`${backupName}\` (ID: \`${newBackupId}\`) criado com sucesso! Os detalhes e a senha foram enviados para sua DM.`,
                flags: EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error('Erro ao criar backup CloudFlow:', error);
            return await interaction.followUp({
                content: '❌ Ocorreu um erro crítico ao criar o backup. Verifique os logs.',
                flags: EPHEMERAL_FLAG
            });
        }
    },
};