// Crie/Substitua em: handlers/buttons/tickets_config_greeting.js
const db = require('../../database.js');
const generateGreetingMenu = require('../../ui/ticketsGreetingMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_config_greeting',
    async execute(interaction) {
        await interaction.deferUpdate();

        // Verifica se já existem mensagens
        let messages = (await db.query('SELECT * FROM ticket_greeting_messages WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;

        // Se não houver nenhuma mensagem, cadastra a padrão
        if (messages.length === 0) {
            const defaultMessage = `> Olá {user}! 👋\n> \n> Seu ticket foi aberto com sucesso no servidor **{server}**.\n> \n> Para agilizar seu atendimento, por favor, nos forneça o máximo de detalhes possível sobre sua solicitação, como:\n> - **O que aconteceu?**\n> - **IDs, se aplicável.**\n> - **Prints ou vídeos do ocorrido.**\n> \n> *Um membro da equipe irá atendê-lo em breve.*`;
            await db.query('INSERT INTO ticket_greeting_messages (guild_id, message, is_active) VALUES ($1, $2, true)', [interaction.guild.id, defaultMessage]);
            // Busca a lista de mensagens novamente para incluir a que acabamos de adicionar
            messages = (await db.query('SELECT * FROM ticket_greeting_messages WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        }

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};

        await interaction.editReply({
            components: generateGreetingMenu(settings, messages),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};