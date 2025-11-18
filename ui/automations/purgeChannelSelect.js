// Local: ui/automations/purgeChannelSelect.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

function getPurgeChannelSelect() {
    return {
        components: [
            {
                type: 17,
                components: [
                    {
                        type: 10,
                        content: "## 🧹 Selecione o Canal"
                    },
                    {
                        type: 10,
                        content: "Escolha abaixo qual canal você deseja configurar para limpeza automática."
                    },
                    { type: 14, divider: true, spacing: 2 },
                    {
                        type: 1, // Action Row
                        components: [
                            {
                                type: 8, // CHANNEL_SELECT
                                custom_id: 'aut_purge_select_channel',
                                placeholder: 'Selecione um canal de texto...',
                                channel_types: [0], // 0 = GUILD_TEXT
                                max_values: 1,
                                min_values: 1
                            }
                        ]
                    }
                ]
            }
        ],
        flags: V2_FLAG | EPHEMERAL_FLAG
    };
}

module.exports = { getPurgeChannelSelect };