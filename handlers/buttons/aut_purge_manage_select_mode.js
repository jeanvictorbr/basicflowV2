// Local: handlers/buttons/aut_purge_manage_select_mode.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');
const db = require('../../database');

module.exports = {
    customId: 'aut_purge_manage_select_mode',
    async execute(interaction) {
        const result = await db.query(
            'SELECT * FROM guild_aut_purge WHERE guild_id = $1 ORDER BY channel_id',
            [interaction.guild.id]
        );

        if (result.rows.length === 0) {
            return interaction.reply({ content: '❌ Não há configurações para remover.', flags: EPHEMERAL_FLAG });
        }

        const options = result.rows.map(config => ({
            label: `Canal ID: ${config.channel_id}`, // Nome do canal é complexo de pegar síncrono, usamos ID
            description: `Apagar a cada ${config.max_age_hours} horas`,
            value: config.channel_id,
            emoji: { name: '🗑️' }
        }));

        // Estrutura V2 para o menu de seleção
        const payload = {
            components: [
                {
                    type: 17,
                    components: [
                        { type: 10, content: "## 🗑️ Remover Automação" },
                        { type: 10, content: "Selecione abaixo qual canal você deseja parar de limpar automaticamente." },
                        { type: 14, divider: true, spacing: 2 },
                        {
                            type: 1, // Action Row contendo o Select
                            components: [{
                                type: 3, // String Select
                                custom_id: 'aut_purge_delete_select',
                                options: options,
                                placeholder: 'Selecione o canal...',
                                min_values: 1,
                                max_values: 1
                            }]
                        },
                        {
                            type: 1, // Action Row para botão voltar
                            components: [{
                                type: 2,
                                label: 'Cancelar / Voltar',
                                style: 2,
                                custom_id: 'aut_purge_menu',
                                emoji: { name: '⬅️' }
                            }]
                        }
                    ]
                }
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        };

        await interaction.update(payload);
    },
};