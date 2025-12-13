// handlers/commands/setup-stats.js
module.exports = {
    async execute(interaction) {
        // Interface V2 Manual: Menu de Seleção de Cargos
        const roleSelectMenu = {
            type: 1, // Action Row
            components: [
                {
                    type: 6, // ROLE_SELECT (Menu de Cargos do Discord)
                    custom_id: 'select_stats_client_role',
                    placeholder: 'Selecione o Cargo de Cliente para o contador',
                    min_values: 1,
                    max_values: 1
                }
            ]
        };

        await interaction.reply({
            content: '📊 **Configuração de Estatísticas**\n\nPara que o contador de clientes funcione corretamente, preciso saber qual cargo representa seus clientes.\n\n🔻 **Selecione o cargo no menu abaixo:**',
            components: [roleSelectMenu],
            ephemeral: true
        });
    }
};