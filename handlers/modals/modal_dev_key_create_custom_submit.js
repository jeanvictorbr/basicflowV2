const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'modal_dev_key_create_custom_submit',
    async execute(interaction) {
        const keyName = interaction.fields.getTextInputValue('key_name').toUpperCase().replace(/\s/g, '-');
        const duration = parseInt(interaction.fields.getTextInputValue('duration'));
        const uses = parseInt(interaction.fields.getTextInputValue('uses'));
        const features = interaction.fields.getTextInputValue('features').split(',').map(f => f.trim());

        if (isNaN(duration) || isNaN(uses)) {
            return interaction.reply({ content: '❌ Duração ou Usos devem ser números.', flags: EPHEMERAL_FLAG });
        }

        try {
            await db.query(
                'INSERT INTO activation_keys (key, duration_days, uses_left, grants_features, comment) VALUES ($1, $2, $3, $4, $5)',
                [keyName, duration, uses, features.join(','), 'Criada manualmente (Personalizada)']
            );

            // Layout de Sucesso V2
            const successLayout = {
                type: 17,
                accent_color: 5763719,
                components: [
                    { type: 10, content: `## ✅ Chave Personalizada Criada!\n\n🔑 **Key:** \`${keyName}\`\n⏳ **Duração:** ${duration} dias\n👥 **Usos:** ${uses}\n🎁 **Features:** ${features.join(', ')}` },
                    { type: 14, divider: true, spacing: 2 },
                    { type: 1, components: [{ type: 2, style: 2, label: "Voltar ao Gerenciador", custom_id: "dev_manage_keys" }] }
                ]
            };

            await interaction.reply({ components: [successLayout], flags: V2_FLAG | EPHEMERAL_FLAG });

        } catch (error) {
            if (error.code === '23505') { // Unique violation
                return interaction.reply({ content: '❌ Já existe uma chave com esse nome. Tente outro.', flags: EPHEMERAL_FLAG });
            }
            console.error(error);
            return interaction.reply({ content: '❌ Erro ao criar chave.', flags: EPHEMERAL_FLAG });
        }
    }
};