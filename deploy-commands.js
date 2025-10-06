// deploy-commands.js
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`[CMD] Iniciando registro de ${commands.length} comando(s) na guild de desenvolvimento.`);

        // A rota foi alterada para registrar os comandos apenas na guild especificada
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID),
            { body: commands },
        );

        console.log(`[CMD] ${data.length} comando(s) registrados com sucesso na guild.`);
    } catch (error) {
        console.error(error);
    }
})();