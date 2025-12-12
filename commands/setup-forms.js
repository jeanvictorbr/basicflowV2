const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-forms')
        .setDescription('🤖 [Automações] Cria e gerencia formulários do servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => 
            sub.setName('criar')
                .setDescription('Cria um novo formulário interativo')
                .addStringOption(op => op.setName('id').setDescription('ID curto e único (ex: staff, denuncia)').setRequired(true))
                .addStringOption(op => op.setName('titulo').setDescription('Título do formulário (ex: Recrutamento)').setRequired(true)))
        .addSubcommand(sub => 
            sub.setName('postar')
                .setDescription('Envia o painel do formulário para um canal')
                .addStringOption(op => op.setName('id').setDescription('ID do formulário para postar').setAutocomplete(true).setRequired(true))
                .addChannelOption(op => op.setName('canal').setDescription('Canal onde o painel será enviado').setRequired(false)))
        .addSubcommand(sub => 
            sub.setName('deletar')
                .setDescription('Apaga um formulário existente')
                .addStringOption(op => op.setName('id').setDescription('ID do formulário').setAutocomplete(true).setRequired(true))),
    
    // Autocomplete para facilitar a vida do admin
    async autocomplete(interaction, db) {
        const focusedValue = interaction.options.getFocused();
        const forms = await db.query('SELECT custom_id, title FROM forms_templates WHERE guild_id = $1', [interaction.guild.id]);
        
        const filtered = forms.rows.filter(choice => choice.custom_id.startsWith(focusedValue) || choice.title.startsWith(focusedValue));
        await interaction.respond(
            filtered.map(choice => ({ name: `${choice.title} (${choice.custom_id})`, value: choice.custom_id }))
        );
    }
};