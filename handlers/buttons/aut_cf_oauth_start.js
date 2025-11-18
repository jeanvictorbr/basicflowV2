// File: handlers/buttons/aut_cf_oauth_start.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const db = require('../../database.js'); //
const crypto = require('crypto');
const { getCloudflowOAuthMenu } = require('../../ui/automations/cloudflowOAuthMenu.js');

module.exports = {
    customId: 'aut_cf_oauth_start',
    async execute(interaction) {
        
        await interaction.deferUpdate({ flags: EPHEMERAL_FLAG });

        try {
            // 1. Gera um novo Client Secret seguro
            const newSecret = crypto.randomBytes(32).toString('hex');
            const guildId = interaction.guild.id;

            // 2. ===== CORREÇÃO DEFINITIVA AQUI =====
            // Trocado a chamada de função inexistente por uma query direta,
            // que é o padrão correto para o seu database.js
            await db.query(
                `INSERT INTO guild_settings (guild_id, cloudflow_oauth_secret)
                 VALUES ($1, $2)
                 ON CONFLICT (guild_id) DO UPDATE SET
                   cloudflow_oauth_secret = $2`,
                [guildId, newSecret]
            );

            // 3. Recarrega as settings e o menu (getGuildSettings está correto)
            const guildSettings = await db.getGuildSettings(guildId);
            const menu = getCloudflowOAuthMenu(guildSettings);
            
            await interaction.editReply(menu);

            // 4. Envia o novo secret em um followup
            await interaction.followUp({
                content: `✅ **Novo Client Secret Gerado com Sucesso!**\nGuarde-o em local seguro, ele não será mostrado novamente:\n\n\`\`\`${newSecret}\`\`\``,
                flags: EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error('Erro ao gerar client secret do OAuth:', error);
            // O catch V2 Puro (da resposta anterior) está mantido e correto
            await interaction.editReply({ 
                type: 17, 
                flags: V2_FLAG | EPHEMERAL_FLAG,
                accent_color: 0xED4245, // Vermelho
                components: [
                    {
                        "type": 10, // Text Component
                        "content": "❌ Ocorreu um erro ao gerar o novo Client Secret."
                    }
                ]
            });
        }
    },
};  