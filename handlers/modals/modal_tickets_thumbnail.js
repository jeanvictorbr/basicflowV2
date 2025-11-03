const db = require('../../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');
const getTicketsMenu = require('../../ui/ticketsMenu.js');

module.exports = {
    customId: 'modal_tickets_thumbnail', // Este é o customId CORRETO
    async execute(interaction) {
        try {
            await interaction.deferUpdate({ flags: V2_FLAG });

            const guildId = interaction.guildId;
            
            // A LINHA CORRIGIDA ESTÁ AQUI:
            // Estava 'tickets_thumbnail_input', mudei para 'input_thumbnail' para bater com o botão.
            const newThumbnail = interaction.fields.getTextInputValue('input_thumbnail');

            // Regex simples para validar se é um link de imagem HTTPS
            const urlRegex = /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp)$/i;

            // Permite salvar um valor nulo se o campo for limpo
            if (newThumbnail && !urlRegex.test(newThumbnail)) {
                return interaction.followUp({
                    content: 'A URL fornecida não é um link de imagem válido (deve ser https e terminar com .png, .jpg, .jpeg, .gif ou .webp).',
                    flags: EPHEMERAL_FLAG | V2_FLAG
                });
            }

            // Atualiza o banco de dados
            await db.query(
                'UPDATE ticket_configs SET thumbnail_url = $1 WHERE guild_id = $2',
                [newThumbnail || null, guildId]
            );

            // Recarrega o menu de tickets com a informação atualizada
            const settings = await db.query('SELECT * FROM ticket_configs WHERE guild_id = $1', [guildId]);
            const config = settings.rows[0] || {};

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