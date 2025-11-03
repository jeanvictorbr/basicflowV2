const db = require('../../database.js');
// A importação abaixo estava errada na sua versão anterior, certifique-se que está assim:
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/analyticsUtils.js'); 
const getTicketsMenu = require('../../ui/ticketsMenu.js');

module.exports = {
    customId: 'modal_tickets_thumbnail',
    async execute(interaction) {
        try {
            await interaction.deferUpdate({ flags: V2_FLAG });

            const guildId = interaction.guildId;
            const newThumbnail = interaction.fields.getTextInputValue('input_thumbnail');

            const urlRegex = /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp)$/i;

            if (newThumbnail && !urlRegex.test(newThumbnail)) {
                return interaction.followUp({
                    content: 'A URL fornecida não é um link de imagem válido (deve ser https e terminar com .png, .jpg, .jpeg, .gif ou .webp).',
                    flags: EPHEMERAL_FLAG | V2_FLAG
                });
            }

            // --- INÍCIO DA CORREÇÃO ---
            // O código estava tentando atualizar a tabela 'ticket_configs' e a coluna 'thumbnail_url'.
            // O correto é atualizar 'guild_settings' e 'tickets_thumbnail_url', como definido no schema.js.
            
            // 1. Atualiza a tabela correta
            await db.query(
                'UPDATE guild_settings SET tickets_thumbnail_url = $1 WHERE guild_id = $2',
                [newThumbnail || null, guildId]
            );

            // 2. Busca da tabela correta para recarregar o menu
            const settings = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId]);
            // --- FIM DA CORREÇÃO ---

            const config = settings.rows[0] || {};

            // O getTicketsMenu já espera o objeto de config da guild_settings
            const menu = getTicketsMenu(config, guildId);
            await interaction.editReply(menu);

        } catch (error) {
            console.error('[modal_tickets_thumbnail] Erro ao processar modal:', error);
            await interaction.followUp({
                content: 'Ocorreu um erro ao tentar salvar a thumbnail.',
                flags: EPHEMERAL_FLAG | V2_FLAG
            }).catch(() => {});
        }
    }
};