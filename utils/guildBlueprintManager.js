const db = require('../database.js');
const { ChannelType, PermissionsBitField } = require('discord.js');

// Helper para logar
const log = async (logChannel, message) => {
    if (logChannel) {
        try {
            await logChannel.send(message);
        } catch (e) {
            console.warn(`Falha ao logar no canal: ${e.message}`);
        }
    } else {
        // Se não houver canal, apenas loga no console
        console.log(`[guildBlueprintManager] ${message}`);
    }
};

// Função de exportação (executada em segundo plano)
async function exportGuildBlueprint(guild, userId, templateName, logChannel) {
    try {
        await log(logChannel, `Iniciando exportação do blueprint: **${templateName}**\nGuilda: ${guild.name} (${guild.id})`);
        
        const blueprint = {
            roles: [],
            categories: [],
            channels: []
        };

        // 1. Salvar Cargos
        await log(logChannel, '`[1/3]` 📥 Coletando cargos...');
        const roles = await guild.roles.fetch();
        const sortedRoles = roles
            .filter(role => !role.managed && role.name !== '@everyone')
            .sort((a, b) => a.position - b.position); 

        for (const role of sortedRoles.values()) {
            blueprint.roles.push({
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                mentionable: role.mentionable,
                permissions: role.permissions.bitfield.toString(),
                position: role.position
            });
        }
        await log(logChannel, `> 💾 ${blueprint.roles.length} cargos salvos.`);

        // 2. Salvar Canais (Categorias primeiro)
        await log(logChannel, '`[2/3]` 📥 Coletando canais e categorias...');
        const channels = await guild.channels.fetch();
        
        const categories = channels
            .filter(c => c.type === ChannelType.GuildCategory)
            .sort((a, b) => a.position - b.position);
            
        const textAndVoiceChannels = channels
            .filter(c => 
                (c.type === ChannelType.GuildText || c.type === ChannelType.GuildVoice) && 
                (!logChannel || c.id !== logChannel.id) // Ignora o canal de log se ele for fornecido
            )
            .sort((a, b) => a.position - b.position);

        // Mapear permissões por NOME do cargo
        const mapPermissions = (channel) => {
            return channel.permissionOverwrites.cache
                .filter(ov => {
                    const role = roles.get(ov.id);
                    return role && !role.managed && role.name !== '@everyone'; // Apenas permissões de cargos que salvaremos
                })
                .map(ov => ({
                    roleName: roles.get(ov.id).name,
                    allow: ov.allow.bitfield.toString(),
                    deny: ov.deny.bitfield.toString()
                }));
        };

        for (const cat of categories.values()) {
            blueprint.categories.push({
                name: cat.name,
                position: cat.position,
                permissions: mapPermissions(cat)
            });
        }

        for (const chan of textAndVoiceChannels.values()) {
            blueprint.channels.push({
                name: chan.name,
                type: chan.type,
                topic: chan.topic,
                parentName: chan.parent ? chan.parent.name : null, // Salva o NOME da categoria pai
                position: chan.position,
                permissions: mapPermissions(chan)
            });
        }
        
        await log(logChannel, `> 💾 ${blueprint.categories.length} categorias e ${blueprint.channels.length} canais salvos.`);

        // 3. Salvar no Banco de Dados (SE O templateName for fornecido, se não, só retorna)
        if (templateName) {
            await log(logChannel, '`[3/3]` 💿 Salvando no banco de dados...');
            await db.query(
                'INSERT INTO guild_blueprints (guild_id, created_by, template_name, template_data) VALUES ($1, $2, $3, $4)',
                [guild.id, userId, templateName, blueprint]
            );
            await log(logChannel, `✅ **Exportação Concluída!** O blueprint **${templateName}** foi salvo com sucesso.`);
        } else {
            await log(logChannel, '`[3/3]` 💿 Exportação finalizada, retornando dados.');
        }

        // Retorna o blueprint para o CloudFlow
        return blueprint; 

    } catch (e) {
        console.error('Falha na exportação do blueprint:', e);
        await log(logChannel, `❌ **Erro Crítico na Exportação:**\n\`\`\`${e.message}\`\`\``);
        return null; // Retorna null em caso de falha
    }
}

// Função de importação (executada em segundo plano)
async function importGuildBlueprint(guild, blueprint, logChannel, client) {
    const counts = { roles: 0, channels: 0 };
    try {
        await log(logChannel, `Iniciando importação do blueprint: **${blueprint.template_name}**...`);
        const data = blueprint.template_data;
        const roleMap = new Map(); // Mapeia 'roleName' -> newRoleObject
        const categoryMap = new Map(); // Mapeia 'categoryName' -> newCategoryObject

        // 1. Limpar Servidor
        await log(logChannel, '`[1/5]` 🧹 Limpando canais existentes...');
        const channels = await guild.channels.fetch();
        for (const channel of channels.values()) {
            if (!logChannel || channel.id !== logChannel.id) {
                try { await channel.delete('Importação de Blueprint'); } catch (e) { console.warn(`Falha ao deletar canal ${channel.name}: ${e.message}`); }
            }
        }

        await log(logChannel, '`[2/5]` 🧹 Limpando cargos existentes...');
        const botRole = guild.members.me.roles.highest;
        const roles = await guild.roles.fetch();
        for (const role of roles.values()) {
            if (!role.managed && role.name !== '@everyone' && role.position < botRole.position) {
                try { await role.delete('Importação de Blueprint'); } catch (e) { console.warn(`Falha ao deletar cargo ${role.name}: ${e.message}`); }
            }
        }
        
        // 2. Criar Cargos
        await log(logChannel, `\`[3/5]\` 📥 Criando ${data.roles.length} cargos...`);
        const sortedRoles = data.roles.sort((a,b) => b.position - a.position);
        
        for (const roleData of sortedRoles) {
            const newRole = await guild.roles.create({
                name: roleData.name,
                color: roleData.color,
                hoist: roleData.hoist,
                mentionable: roleData.mentionable,
                permissions: BigInt(roleData.permissions)
            });
            roleMap.set(roleData.name, newRole);
            counts.roles++;
        }

        // Helper para remapear permissões
        const remapPermissions = (permissionsData) => {
            const overwrites = [];
            for (const perm of permissionsData) {
                const role = roleMap.get(perm.roleName);
                if (role) {
                    overwrites.push({
                        id: role.id,
                        allow: BigInt(perm.allow),
                        deny: BigInt(perm.deny)
                    });
                }
            }
            // Adicionar permissão para o bot ver o canal
            overwrites.push({
                id: client.user.id,
                allow: [
                    PermissionsBitField.Flags.ViewChannel, 
                    PermissionsBitField.Flags.ManageChannels, 
                    PermissionsBitField.Flags.ManageRoles
                ]
            });
            return overwrites;
        };

        // 3. Criar Categorias
        await log(logChannel, `\`[4/5]\` 📥 Criando ${data.categories.length} categorias...`);
        const sortedCategories = data.categories.sort((a,b) => a.position - b.position);

        for (const catData of sortedCategories) {
            const newCat = await guild.channels.create({
                name: catData.name,
                type: ChannelType.GuildCategory,
                position: catData.position,
                permissionOverwrites: remapPermissions(catData.permissions)
            });
            categoryMap.set(catData.name, newCat);
            counts.channels++;
        }

        // 4. Criar Canais
        await log(logChannel, `\`[5/5]\` 📥 Criando ${data.channels.length} canais...`);
        const sortedChannels = data.channels.sort((a,b) => a.position - b.position);

        for (const chanData of sortedChannels) {
            const parent = chanData.parentName ? categoryMap.get(chanData.parentName) : null;
            await guild.channels.create({
                name: chanData.name,
                type: chanData.type,
                topic: chanData.topic,
                parent: parent ? parent.id : null,
                position: chanData.position,
                permissionOverwrites: remapPermissions(chanData.permissions)
            });
            counts.channels++;
        }
        
        await log(logChannel, `✅ **Importação Concluída!** O blueprint **${blueprint.template_name}** foi aplicado.`);
        return { success: true, counts: counts };

    } catch (e) {
        console.error('Falha na importação do blueprint:', e);
        await log(logChannel, `❌ **Erro Crítico na Importação:**\n\`\`\`${e.stack}\`\`\`\nO processo foi interrompido. O servidor pode estar em um estado inconsistente.`);
        return { success: false, error: e.message, counts: counts };
    }
}

module.exports = {
    exportGuildBlueprint,
    importGuildBlueprint
};