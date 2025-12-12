const db = require('../../database.js');
const { getFormApplyPanel } = require('../../ui/forms/formApplyPanel.js'); // Importa o visual do painel final
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'form_post_save_',
    async execute(interaction) {
        const customId = interaction.customId.split('form_post_save_')[1];
        const targetChannelId = interaction.values[0];

        // 1. Busca dados do formulário
        const form = await db.query('SELECT * FROM forms_templates WHERE guild_id = $1 AND custom_id = $2', [interaction.guild.id, customId]);
        if (form.rows.length === 0) return interaction.update({ components: [{ type: 10, content: "❌ Formulário não encontrado.", style: 3 }] });

        const data = form.rows[0];

        // 2. Validação final
        if (!data.log_channel_id) {
            return interaction.update({ components: [{ type: 10, content: "❌ **Erro:** Configure um Canal de Logs antes de postar!", style: 3 }] });
        }

        const targetChannel = interaction.guild.channels.cache.get(targetChannelId);
        if (!targetChannel) {
            return interaction.update({ components: [{ type: 10, content: "❌ Canal de destino inválido.", style: 3 }] });
        }

        // 3. Gera o Painel Visual (V2)
        const panelUI = getFormApplyPanel(data);

        // 4. Envia
        try {
            await targetChannel.send({
                components: panelUI.components, // Manda apenas os componentes V2
                flags: V2_FLAG
            });

            await interaction.update({ 
                components: [{ type: 10, content: `✅ **Sucesso!** O formulário **${data.title}** foi postado em ${targetChannel}.`, style: 1 }], 
                flags: V2_FLAG 
            });

        } catch (error) {
            console.error(error);
            await interaction.update({ 
                components: [{ type: 10, content: `❌ **Erro ao enviar:** Verifique se eu tenho permissão de "Ver Canal" e "Enviar Mensagens" em ${targetChannel}.`, style: 3 }], 
                flags: V2_FLAG 
            });
        }
    }
};