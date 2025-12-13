// force_register.js
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const devCommands = [];
// Comandos que só devem ir para o servidor de dev (opcional)
const devOnlyCommandNames = ['devpanel', 'debugai']; 

const commandsPath = path.join(__dirname, 'commands');

console.log('📂 Lendo comandos da pasta /commands...');

try {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        if (command.data) {
            // Se for comando de dev, separa
            if (devOnlyCommandNames.includes(command.data.name)) {
                devCommands.push(command.data.toJSON());
            } else {
                // Se for comando normal, vai para a lista global
                commands.push(command.data.toJSON());
            }
            console.log(`   🔹 Carregado: /${command.data.name}`);
        } else {
            console.log(`   ⚠️  Aviso: O comando ${file} não tem "data" ou "execute".`);
        }
    }
} catch (error) {
    console.error('❌ Erro ao ler pasta commands:', error);
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('\n🚀 INICIANDO O REGISTRO FORÇADO...');

        // 1. FORÇAR REGISTRO GLOBAL (Para todos os servidores)
        if (commands.length > 0) {
            console.log(`🌍 Enviando ${commands.length} comandos GLOBAIS para a API...`);
            const dataGlobal = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log(`✅ Sucesso! ${dataGlobal.length} comandos globais registrados.`);
        } else {
            console.log('⚠️ Nenhum comando global encontrado para registrar.');
        }

        // 2. FORÇAR REGISTRO NA GUILD DE DEV (Se houver ID no .env)
        // Isso inclui os globais + os de dev para você testar tudo lá
        if (process.env.DEV_GUILD_ID) {
            const allDevCommands = [...commands, ...devCommands];
            console.log(`🛠️  Enviando ${allDevCommands.length} comandos para a GUILD DE DEV (${process.env.DEV_GUILD_ID})...`);
            
            const dataDev = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID),
                { body: allDevCommands },
            );
            console.log(`✅ Sucesso! ${dataDev.length} comandos de dev registrados.`);
        } else {
            console.log('ℹ️  Pulei o registro de dev (DEV_GUILD_ID não está no .env).');
        }

        console.log('\n🏁 PROCESSO CONCLUÍDO. Seus comandos devem aparecer agora.');
        console.log('   (Nota: Comandos globais podem levar até 1 hora para atualizar em outros servidores, mas na Guild de Dev é instantâneo).');

    } catch (error) {
        console.error('\n❌ ERRO FATAL NO REGISTRO:');
        console.error(error);
    }
})();