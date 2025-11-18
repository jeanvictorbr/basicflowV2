// handlers/modals/aut_cf_backup_restore_modal.js
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');
const db = require('../../database');
const bcrypt = require('bcrypt');

module.exports = {
    customId: 'aut_cf_backup_restore_modal',
    async execute(interaction) {
        
        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });

        const backupIdInput = interaction.fields.getTextInputValue('backup_id');
        const password = interaction.fields.getTextInputValue('backup_password');
        
        const guild = interaction.guild;
        const user = interaction.user;

        // --- INÍCIO DA CORREÇÃO DE ERRO ---
        // 1. Validar se o ID é um número
        const backupId = parseInt(backupIdInput);
        if (isNaN(backupId)) {
            return await interaction.followUp({
                content: '❌ ID do Backup inválido! O ID deve ser um **número** (como `123`) que você recebeu na sua DM.',
                flags: EPHEMERAL_FLAG
            });
        }
        // --- FIM DA CORREÇÃO DE ERRO ---

        try {
            // --- INÍCIO DA CORREÇÃO DA REGRA DE NEGÓCIO ---
            // 2. Busca o backup
            const { rows } = await db.query(
                // REMOVIDO: "AND guild_id = $2"
                // Agora, a restauração é global, desde que o user_id seja o dono.
                'SELECT * FROM cloudflow_backups WHERE backup_id = $1 AND user_id = $2',
                [backupId, user.id]
            );

            if (rows.length === 0) {
                return await interaction.followUp({
                    content: '❌ Backup não encontrado! Verifique o ID e tente novamente. (Lembre-se: você só pode restaurar backups que **você** criou).',
                    flags: EPHEMERAL_FLAG
                });
            }
            // --- FIM DA CORREÇÃO DA REGRA DE NEGÓCIO ---

            const backup = rows[0];
            const backupOriginalGuildId = backup.guild_id; // Guardamos para fins de informação

            // 3. Compara a senha
            const isMatch = await bcrypt.compare(password, backup.password_hash);

            if (!isMatch) {
                return await interaction.followUp({
                    content: '❌ Senha incorreta! Tente novamente.',
                    flags: EPHEMERAL_FLAG
                });
            }

            // 4. Se tudo estiver correto, mostra a confirmação final
            const backupDate = new Date(Number(backup.created_at)).toLocaleString('pt-BR');

            const confirmationMenu = [
                {
                    type: 17,
                    accent_color: 0xED4245, // Vermelho Perigo
                    components: [
                        {
                            type: 10,
                            content: `## ⚠️ Confirmação Final de Restauração`
                        },
                        {
                            type: 10,
                            content: `**Você está prestes a restaurar o backup:**\n` +
                                     `> **Nome:** ${backup.backup_name}\n` +
                                     `> **ID:** ${backup.backup_id}\n` +
                                     `> **Criado em:** ${backupDate}\n` +
                                     `> **Servidor de Origem:** \`${backupOriginalGuildId}\`\n\n` +
                                     `**AVISO CRÍTICO:** Esta ação é **IRREVERSÍVEL** e afetará o servidor **${guild.name}**.\n` +
                                     `1. **DELETARÁ** todos os canais, categorias e cargos atuais deste servidor.\n` +
                                     `2. **CRIARÁ** a estrutura salva no backup.\n\n` +
                                     `O bot fará o possível para manter as configurações do servidor, mas a estrutura de canais/cargos será **SOBRESCRITA**.`
                        },
                        { type: 14, divider: true, spacing: 2 }, 
                        {
                            type: 1,
                            components: [
                                {
                                    type: 2, style: 4, // Vermelho
                                    label: 'Sim, restaurar neste servidor',
                                    emoji: { name: '🔄' },
                                    custom_id: `aut_cf_backup_confirm_restore_${backup.backup_id}`
                                },
                                {
                                    type: 2, style: 2, // Cinza
                                    label: 'Cancelar',
                                    emoji: { name: '✖️' },
                                    custom_id: 'aut_cf_manage_backups' // Apenas recarrega o menu
                                }
                            ]
                        }
                    ]
                }
            ];

            return await interaction.editReply({
                ...confirmationMenu[0],
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error('Erro ao verificar backup para restauração:', error);
            return await interaction.followUp({
                content: '❌ Ocorreu um erro crítico ao verificar o backup. Verifique os logs.',
                flags: EPHEMERAL_FLAG
            });
        }
    },
};