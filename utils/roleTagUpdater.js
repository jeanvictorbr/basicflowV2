// utils/roleTagUpdater.js
const db = require('../database.js');

async function updateUserTag(member) {
    if (!member || !member.guild) return;

    // 1. Verifica se o bot tem permissão e se o cargo dele é superior ao do membro
    const botMember = await member.guild.members.fetch(member.client.user.id);
    if (!botMember.permissions.has('ManageNicknames') || botMember.roles.highest.position <= member.roles.highest.position) {
        return; // Sem permissão ou hierarquia para alterar
    }

    // 2. Busca todas as regras de tag para o servidor
    const tagsResult = await db.query('SELECT role_id, tag FROM role_tags WHERE guild_id = $1', [member.guild.id]);
    if (tagsResult.rows.length === 0) return; // Nenhuma tag configurada

    const allTagsMap = new Map(tagsResult.rows.map(r => [r.role_id, r.tag]));

    // 3. Encontra o cargo mais alto do membro que possui uma tag
    let highestRoleWithTag = null;
    member.roles.cache.forEach(role => {
        if (allTagsMap.has(role.id)) {
            if (!highestRoleWithTag || role.position > highestRoleWithTag.position) {
                highestRoleWithTag = role;
            }
        }
    });

    // 4. Limpa o apelido atual de todas as tags conhecidas
    const currentNickname = member.nickname || member.user.username;
    let cleanNickname = currentNickname;
    allTagsMap.forEach(tag => {
        // Usa uma expressão regular para remover a tag, mesmo com espaços
        const regex = new RegExp(`^\\s*${tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*`, 'i');
        cleanNickname = cleanNickname.replace(regex, '');
    });

    // 5. Monta o novo apelido
    let newNickname = cleanNickname;
    if (highestRoleWithTag) {
        const newTag = allTagsMap.get(highestRoleWithTag.id);
        newNickname = `${newTag} ${cleanNickname}`;
    }

    // 6. Verifica o limite de caracteres e se houve de fato uma mudança
    if (newNickname.length > 32) {
        newNickname = newNickname.substring(0, 32); // Trunca para evitar erros
    }

    if (newNickname !== member.nickname) {
        try {
            await member.setNickname(newNickname, 'Atualização automática de RoleTag');
        } catch (error) {
            console.error(`[RoleTags] Falha ao atualizar o apelido de ${member.user.tag}:`, error.message);
        }
    }
}

module.exports = { updateUserTag };