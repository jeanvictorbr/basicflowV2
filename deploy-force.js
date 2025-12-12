// deploy-force.js
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Configuração
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
    console.error('❌ Erro: DISCORD_TOKEN ou CLIENT_ID faltando no arquivo .env');
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log('📦 Escaneando comandos...');

for (const file of commandFiles) {
    try {
        const command = require(path.join(commandsPath, file));
        if (command.data && command.data.name) {
            commands.push(command.data.toJSON());
            if (command.data.name === 'daily') {
                console.log('✅ Comando DAILY detectado e preparado!');
            }
        } else {
            console.warn(`⚠️ [Aviso] O arquivo ${file} não exporta "data" corretamente.`);
        }
    } catch (e) {
        console.error(`❌ Erro ao carregar ${file}:`, e.message);
    }
}

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log(`🚀 Forçando atualização GLOBAL de ${commands.length} comandos...`);

        // Usa PUT para sobrescrever tudo
        const data = await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ SUCESSO! ${data.length} comandos registrados na API.`);
        console.log('🔄 Reinicie seu Discord (Ctrl+R) para ver as mudanças imediatamente.');
    } catch (error) {
        console.error('❌ Falha no registro:', error);
    }
})();