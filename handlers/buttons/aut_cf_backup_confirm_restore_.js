// handlers/buttons/aut_cf_backup_confirm_restore_.js
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');
const db = require('../../database');
const guildBlueprintManager = require('../../utils/guildBlueprintManager');
const { buildCloudFlowBackupsMenu } = require('../../ui/automations/cloudflowBackupsMenu');

module.exports = {
    customId: 'aut_cf_backup_confirm_restore_', // Handler dinâmico
    async execute(interaction) {
        
        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });

        const backupId = parseInt(interaction.customId.split('_').pop()); // Garantir que é int
        const guild = interaction.guild;
        const user = interaction.user;

        if (isNaN(backupId)) {
            return await interaction.followUp({ content: '❌ ID de Backup inválido.', flags: EPHEMERAL_FLAG });
        }

        try {
            // 1. Re-busca o backup para segurança e para pegar os dados
            // --- CORREÇÃO DA REGRA DE NEGÓCIO ---
            // REMOVIDO: "AND guild_id = $2"
            const { rows } = await db.query(
                'SELECT backup_data, backup_name FROM cloudflow_backups WHERE backup_id = $1 AND user_id = $2',
                [backupId, user.id]
            );

            if (rows.length === 0) {
                return await interaction.followUp({
                    content: '❌ Erro de segurança! O backup não foi encontrado ou você não é o dono dele.',
                    flags: EPHEMERAL_FLAG
                });
            }
            // --- FIM DA CORREÇÃO ---

            const backupData = rows[0].backup_data;
            const backupName = rows[0].backup_name;

            if (typeof backupData !== 'object' || backupData === null) {
                return await interaction.followUp({
                    content: '❌ Erro Crítico! Os dados do backup estão corrompidos no banco de dados.',
                    flags: EPHEMERAL_FLAG
                });
            }
            
            // 2. Envia aviso de início
            await interaction.followUp({
                content: `Iniciando restauração do backup \`${backupName}\`. O servidor ficará instável pelos próximos minutos. **Não execute nenhuma outra ação de configuração.**`,
                flags: EPHEMERAL_FLAG
            });

            // 3. Executa a importação (a lógica destrutiva)
            const blueprintObject = {
                template_name: backupName,
                template_data: backupData
            };
            
            const result = await guildBlueprintManager.importGuildBlueprint(
                guild, 
                blueprintObject, 
                null, 
                interaction.client
            );

            if (!result || !result.success) {
                const errorMsg = result ? result.error : 'Erro desconhecido.';
                return await interaction.followUp({
                    content: `❌ **Falha na Restauração!**\nO processo foi interrompido. Causa: \`${errorMsg}\`\nO servidor pode estar em um estado inconsistente. Recomenda-se restaurar um backup anterior ou reconfigurar manualmente.`,
                    flags: EPHEMERAL_FLAG
                });
            }

            // 4. Sucesso! Recarrega o dashboard
            await interaction.followUp({
                content: `✅ Sucesso! O servidor **${guild.name}** foi restaurado para o estado do backup \`${backupName}\`.\nCanais Criados: \`${result.counts.channels}\`\nCargos Criados: \`${result.counts.roles}\``,
                flags: EPHEMERAL_FLAG
            });

            const menu = await buildCloudFlowBackupsMenu(interaction);
            return await interaction.editReply({
                ...menu[0],
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error('Erro ao EXECUTAR restauração de backup:', error);
            await interaction.followUp({
                content: `❌ Ocorreu um erro crítico durante a execução da restauração: \`${error.message}\`. O servidor pode estar em um estado inconsistente.`,
                flags: EPHEMERAL_FLAG
            });
            
            try {
                const menu = await buildCloudFlowBackupsMenu(interaction);
                await interaction.editReply({
                    ...menu[0],
                    flags: V2_FLAG | EPHEMERAL_FLAG
                });
            } catch (e) {}
        }
    },
};