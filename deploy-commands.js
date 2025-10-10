// Substitua o conteúdo em: deploy-commands.js
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

// --- LÓGICA DE SEPARAÇÃO ADICIONADA ---
const commands = [];
const devCommands = [];
const devOnlyCommandNames = ['devpanel', 'debugai', 'enviar']; // Lista de comandos de dev

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data) {
        if (devOnlyCommandNames.includes(command.data.name)) {
            devCommands.push(command.data.toJSON());
        } else {
            commands.push(command.data.toJSON());
        }
    }
}
// --- FIM DA LÓGICA DE SEPARAÇÃO ---

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        // 1. REGISTRA OS COMANDOS GLOBAIS (PARA CLIENTES)
        console.log(`[CMD] Iniciando registro de ${commands.length} comando(s) globais.`);
        const globalData = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log(`[CMD] ${globalData.length} comando(s) globais registrados com sucesso.`);

        // 2. REGISTRA TODOS OS COMANDOS (GLOBAIS + DEV) NA GUILD DE DESENVOLVIMENTO
        if (process.env.DEV_GUILD_ID) {
            const allDevCommands = [...commands, ...devCommands];
            console.log(`[CMD] Iniciando registro de ${allDevCommands.length} comando(s) na guild de desenvolvimento.`);
            const devData = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID),
                { body: allDevCommands },
            );
            console.log(`[CMD] ${devData.length} comando(s) de desenvolvimento registrados com sucesso.`);
        } else {
            console.warn('[CMD] A variável DEV_GUILD_ID não está definida no .env. Comandos de desenvolvedor não foram registrados.');
        }

    } catch (error) {
        console.error(error);
    }
})();