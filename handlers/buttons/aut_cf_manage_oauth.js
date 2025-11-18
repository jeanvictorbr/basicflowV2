// File: handlers/buttons/aut_cf_manage_oauth.js
// CONTEÚDO COMPLETO E ATUALIZADO

const db = require('../../database.js'); 
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js'); 
const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    customId: 'aut_cf_manage_oauth',
    async execute(interaction) {
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ 
                content: 'Você não tem permissão para acessar esta configuração.', 
                flags: EPHEMERAL_FLAG 
            });
        }

        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });

        try {
            // --- LINHA DE CORREÇÃO DE CACHE ADICIONADA ---
            // Força o Node a limpar o cache deste arquivo de UI específico
            delete require.cache[require.resolve('../../ui/automations/cloudflowOAuthMenu.js')];
            // --- FIM DA ADIÇÃO ---

            // Agora, esta importação vai pegar o arquivo "fresco" do disco
            const { getCloudflowOAuthMenu } = require('../../ui/automations/cloudflowOAuthMenu.js'); 

            const guildSettings = await db.getGuildSettings(interaction.guild.id);
            const menu = getCloudflowOAuthMenu(guildSettings);
            
            await interaction.editReply(menu);

        } catch (error) {
            console.error('Erro ao construir menu OAuth:', error);
            
            await interaction.editReply({ 
                type: 17, 
                flags: V2_FLAG | EPHEMERAL_FLAG,
                accent_color: 0xED4245, // Vermelho
                components: [
                    {
                        "type": 10, // Text Component
                        "content": "❌ Ocorreu um erro ao carregar o menu OAuth."
                    }
                ]
            });
        }
    }
};