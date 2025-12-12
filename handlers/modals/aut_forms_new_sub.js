const db = require('../../database.js');
const { getFormBuilderPanel } = require('../../ui/forms/formBuilderUI.js'); // Use o arquivo que criamos na etapa anterior
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'aut_forms_new_sub',
    async execute(interaction) {
        const customId = interaction.fields.getTextInputValue('id').toLowerCase().replace(/\s+/g, '_');
        const title = interaction.fields.getTextInputValue('title');

        try {
            // Pergunta padrão para não bugar
            const defaultQ = [{ id: 'q1', label: 'Sua mensagem:', style: 2, required: true }];

            await db.query(`
                INSERT INTO forms_templates (guild_id, custom_id, title, questions)
                VALUES ($1, $2, $3, $4)
            `, [interaction.guild.id, customId, title, JSON.stringify(defaultQ)]);

            // Gera o Painel de Edição
            const builderUI = getFormBuilderPanel({ customId, title, questions: defaultQ, logChannelId: null });

            // RESPOSTA V2 CORRETA: Sem 'content', apenas components
            // Adicionamos um aviso de sucesso como componente de texto no topo
            const successMsg = { type: 10, content: `✅ **Sucesso!** O formulário \`${title}\` foi criado.`, style: 1 };
            
            await interaction.reply({
                components: [successMsg, ...builderUI.components], // Junta o aviso com o painel
                flags: V2_FLAG,
                ephemeral: true
            });

        } catch (err) {
            // Tratamento de erro V2
            const errorMsg = err.code === '23505' ? "❌ Já existe um formulário com esse ID." : "❌ Erro ao salvar.";
            await interaction.reply({
                components: [{ type: 10, content: errorMsg, style: 3 }],
                flags: V2_FLAG,
                ephemeral: true
            });
        }
    }
};