// Local: handlers/modals/modal_aut_purge_submit_.js
const { getPurgeMenu } = require('../../ui/automations/purgeMenu');
const db = require('../../database');

module.exports = {
    // O underscore final captura IDs dinâmicos: modal_aut_purge_submit_123456
    customId: 'modal_aut_purge_submit_', 
    async execute(interaction) {
        // 1. Extrair ID do canal do customId do Modal
        const channelId = interaction.customId.split('_').pop();
        
        // 2. Pegar o input de tempo
        const rawInput = interaction.fields.getTextInputValue('purge_time_input').trim().toLowerCase();
        
        // 3. Parser de tempo (Regex)
        const timeRegex = /^(\d+)(m|h|d)?$/;
        const match = rawInput.match(timeRegex);

        if (!match) {
            return interaction.reply({ 
                content: '❌ Formato inválido! Use números seguidos de m, h ou d.\nExemplos: `30m`, `12h`, `5d`.', 
                ephemeral: true 
            });
        }

        const value = parseInt(match[1]);
        const unit = match[2] || 'h'; // Default para horas se não especificar

        let hours;
        let displayTime;

        switch (unit) {
            case 'm':
                hours = value / 60; // Converte minutos para horas (float)
                displayTime = `${value} minutos`;
                break;
            case 'd':
                hours = value * 24; // Converte dias para horas
                displayTime = `${value} dias`;
                break;
            case 'h':
            default:
                hours = value;
                displayTime = `${value} horas`;
                break;
        }

        if (hours <= 0) {
            return interaction.reply({ content: '❌ O tempo deve ser maior que zero.', ephemeral: true });
        }

        // 4. Salvar no banco
        try {
            await db.query(`
                INSERT INTO guild_aut_purge (guild_id, channel_id, max_age_hours, enabled)
                VALUES ($1, $2, $3, true)
                ON CONFLICT (guild_id, channel_id) 
                DO UPDATE SET max_age_hours = EXCLUDED.max_age_hours, enabled = TRUE;
            `, [interaction.guild.id, channelId, hours]);

            // 5. Atualizar menu principal
            const result = await db.query(
                'SELECT * FROM guild_aut_purge WHERE guild_id = $1 ORDER BY channel_id',
                [interaction.guild.id]
            );
            
            const payload = getPurgeMenu(result.rows);
            
            // Adiciona feedback visual na interface V2
            payload.components[0].components.splice(2, 0, {
                type: 10,
                content: `✅ Configurado: <#${channelId}> limpará mensagens com mais de **${displayTime}**.`
            });

            await interaction.update(payload);

        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ Erro ao salvar no banco de dados.', ephemeral: true });
        }
    },
};