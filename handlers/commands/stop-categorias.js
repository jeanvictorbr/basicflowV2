// Crie este arquivo em: handlers/commands/stop-categorias.js
const db = require('../../database.js');
const { EmbedBuilder } = require('discord.js');

const DEFAULT_CATEGORIES = "Nome,Cor,Carro,Cidade,Fruta,País,Objeto".split(',');

module.exports = {
    customId: 'stop-categorias',
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'adicionar': {
                const name = interaction.options.getString('nome').trim();
                await db.query('INSERT INTO stop_categories (guild_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING', [interaction.guild.id, name]);
                return interaction.reply({ content: `✅ Categoria "${name}" adicionada.`, ephemeral: true });
            }
            case 'remover': {
                // Implementação futura, por enquanto só remove a última
                 const lastCat = await db.query('SELECT id FROM stop_categories WHERE guild_id = $1 ORDER BY id DESC LIMIT 1', [interaction.guild.id]);
                 if (lastCat.rows.length > 0) {
                    await db.query('DELETE FROM stop_categories WHERE id = $1', [lastCat.rows[0].id]);
                    return interaction.reply({ content: '✅ Última categoria adicionada foi removida.', ephemeral: true });
                 }
                 return interaction.reply({ content: '❌ Nenhuma categoria personalizada para remover.', ephemeral: true });
            }
            case 'listar': {
                const categoriesResult = await db.query('SELECT name FROM stop_categories WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id]);
                const categories = categoriesResult.rows.map(r => r.name);
                const list = categories.length > 0 ? categories.join(', ') : 'Nenhuma categoria personalizada. Usando o padrão: ' + DEFAULT_CATEGORIES.join(', ');
                return interaction.reply({ content: `**Categorias Atuais do Stop!:**\n${list}`, ephemeral: true });
            }
            case 'resetar': {
                await db.query('DELETE FROM stop_categories WHERE guild_id = $1', [interaction.guild.id]);
                return interaction.reply({ content: '✅ Categorias do Stop! resetadas para o padrão do bot.', ephemeral: true });
            }
        }
    }
};