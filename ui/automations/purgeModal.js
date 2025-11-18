// Local: ui/automations/purgeModal.js

function getPurgeConfigModal() {
    return {
        title: 'Configurar Auto-Purge',
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4, // TextInput
                        custom_id: 'purge_channel_id',
                        label: 'ID do Canal',
                        style: 1, // Short
                        placeholder: 'Cole o ID do canal aqui',
                        required: true,
                        min_length: 17,
                        max_length: 20
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4, // TextInput
                        custom_id: 'purge_hours',
                        label: 'Idade Máxima (em Horas)',
                        style: 1, // Short
                        placeholder: 'Ex: 24 (para 1 dia), 168 (para 1 semana)',
                        required: true,
                        min_length: 1,
                        max_length: 4
                    }
                ]
            }
        ]
    };
}

module.exports = { getPurgeConfigModal };