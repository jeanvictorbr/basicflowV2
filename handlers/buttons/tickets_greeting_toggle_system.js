// Crie ou substitua em: handlers/buttons/tickets_greeting_toggle_system.js
const db = require('../../database.js');
const generateGreetingMenu = require('../../ui/ticketsGreetingMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_greeting_toggle_system',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const currentSettings = (await db.query('SELECT tickets_greeting_enabled FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const isCurrentlyEnabled = currentSettings?.tickets_greeting_enabled;

        // Se estiver desativado e prestes a ser ativado
        if (!isCurrentlyEnabled) {
            const existingMessages = (await db.query('SELECT 1 FROM ticket_greeting_messages WHERE guild_id = $1', [interaction.guild.id])).rows;
            // Se não houver nenhuma mensagem, adiciona a padrão melhorada
            if (existingMessages.length === 0) {
                // NOVA MENSAGEM PADRÃO, MAIS COMPLETA E COM MARKDOWN
                const defaultMessage = `> Olá {user}! 👋\n> \n> Seu ticket foi aberto com sucesso no servidor **{server}**.\n> \n> Para agilizar seu atendimento, por favor, nos forneça o máximo de detalhes possível sobre sua solicitação, como:\n> - **O que aconteceu?**\n> - **IDs, se aplicável.**\n> - **Prints ou vídeos do ocorrido.**\n> \n> *Um membro da equipe irá atendê-lo em breve.*`;
                await db.query('INSERT INTO ticket_greeting_messages (guild_id, message, is_active) VALUES ($1, $2, true)', [interaction.guild.id, defaultMessage]);
            }
        }
        
        await db.query(`UPDATE guild_settings SET tickets_greeting_enabled = NOT COALESCE(tickets_greeting_enabled, false) WHERE guild_id = $1`, [interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const messages = (await db.query('SELECT * FROM ticket_greeting_messages WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;

        await interaction.editReply({
            components: generateGreetingMenu(settings, messages),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};