const db = require('../../database.js');
const { getFormBuilderPanel } = require('../../ui/forms/formBuilderUI.js'); // Vamos criar este UI abaixo
const { getFormApplyPanel } = require('../../ui/forms/formApplyPanel.js'); // E este também
const V2_FLAG = 1 << 15;

module.exports = async (interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (subcommand === 'criar') {
        const customId = interaction.options.getString('id').toLowerCase().replace(/\s+/g, '_');
        const title = interaction.options.getString('titulo');

        // Verifica limite (opcional, mas bom pra evitar spam)
        const count = await db.query('SELECT COUNT(*) FROM forms_templates WHERE guild_id = $1', [guildId]);
        if (parseInt(count.rows[0].count) >= 10) {
            return interaction.reply({ content: "❌ Limite de 10 formulários por servidor atingido.", ephemeral: true });
        }

        try {
            // Cria com uma pergunta placeholder
            const defaultQuestions = [{
                id: 'q1',
                label: 'Escreva sua mensagem:',
                style: 2, // Paragraph
                required: true,
                placeholder: 'Digite aqui...'
            }];

            await db.query(`
                INSERT INTO forms_templates (guild_id, custom_id, title, questions)
                VALUES ($1, $2, $3, $4)
            `, [guildId, customId, title, JSON.stringify(defaultQuestions)]);

            // Mostra o Painel de Construção (Builder)
            const builderUI = getFormBuilderPanel({ customId, title, questions: defaultQuestions, logChannelId: null });
            
            await interaction.reply({
                content: `✅ **Formulário Criado!** Agora adicione perguntas e configure o canal de logs abaixo.`,
                components: builderUI.components,
                flags: V2_FLAG,
                ephemeral: true
            });

        } catch (err) {
            if (err.code === '23505') return interaction.reply({ content: "❌ Já existe um formulário com esse ID.", ephemeral: true });
            console.error(err);
            return interaction.reply({ content: "Erro ao criar formulário.", ephemeral: true });
        }
    }

    if (subcommand === 'postar') {
        const customId = interaction.options.getString('id');
        const channel = interaction.options.getChannel('canal') || interaction.channel;

        const form = await db.query('SELECT * FROM forms_templates WHERE guild_id = $1 AND custom_id = $2', [guildId, customId]);
        if (form.rows.length === 0) return interaction.reply({ content: "Formulário não encontrado.", ephemeral: true });

        const data = form.rows[0];
        
        // Verifica se tem canal de logs configurado
        if (!data.log_channel_id) {
            return interaction.reply({ content: "⚠️ **Atenção:** Você precisa configurar um **Canal de Logs** antes de postar! Use o menu de edição.", ephemeral: true });
        }

        const panelUI = getFormApplyPanel(data);

        try {
            await channel.send({ 
                components: panelUI.components,
                flags: V2_FLAG
            });
            await interaction.reply({ content: `✅ Formulário **${data.title}** postado em ${channel}!`, ephemeral: true });
        } catch (e) {
            await interaction.reply({ content: `❌ Erro ao postar (verifique permissões no canal alvo).`, ephemeral: true });
        }
    }

    if (subcommand === 'deletar') {
        const customId = interaction.options.getString('id');
        await db.query('DELETE FROM forms_templates WHERE guild_id = $1 AND custom_id = $2', [guildId, customId]);
        await interaction.reply({ content: `🗑️ Formulário **${customId}** deletado.`, ephemeral: true });
    }
};