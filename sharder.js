const { ShardingManager } = require('discord.js');
require('dotenv').config();

const manager = new ShardingManager('./index.js', { 
    token: process.env.DISCORD_TOKEN,
    totalShards: 'auto' // O Discord vai sugerir a quantidade ideal baseada em 600 servidores
});

manager.on('shardCreate', shard => console.log(`[SHARD] Iniciando shard ${shard.id}`));
manager.spawn();