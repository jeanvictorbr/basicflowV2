// handlers/buttons/mod_ver_punicoes_ativas.js
const db = require('../../database.js');
const generateModeracaoPunicoesAtivasMenu = require('../../ui/moderacaoPunicoesAtivasMenu.js');
const ms = require('ms');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

async function getActiveSanctions(guildId) {
    // 1. Punições (Timeouts e Bans)
    const punishmentLogs = (await db.query(
        "SELECT * FROM moderation_logs WHERE guild_id = $1 AND action IN ('TIMEOUT', 'BAN') AND duration IS NOT NULL",
        [guildId]
    )).rows;

    const activePunishments = punishmentLogs.filter(log => {
        try {
            return (new Date(log.created_at).getTime() + ms(log.duration)) > Date.now();
        } catch (e) { return false; }
    }).map(p => ({
        type: 'PUNISHMENT',
        id: p.case_id,
        action: p.action,
        userId: p.user_id,
        reason: p.reason,
        expiresAt: new Date(p.created_at).getTime() + ms(p.duration)
    }));

    // 2. Infrações do Guardian AI
    const infractionLogs = (await db.query(`
        SELECT i.user_id, i.infraction_count, i.last_infraction_at, i.policy_id, p.name as policy_name, p.reset_interval_hours
        FROM guardian_infractions AS i
        JOIN guardian_policies AS p ON i.policy_id = p.id
        WHERE i.guild_id = $1 AND i.last_infraction_at + (p.reset_interval_hours * interval '1 hour') > NOW()
    `, [guildId])).rows;

    const activeInfractions = infractionLogs.map(i => ({
        type: 'INFRACTION',
        id: `${i.user_id}_${i.policy_id}`, // ID Composto
        userId: i.user_id,
        details: `Nível ${i.infraction_count} [${i.policy_name}]`,
        expiresAt: new Date(i.last_infraction_at).getTime() + (i.reset_interval_hours * 60 * 60 * 1000)
    }));

    // 3. Juntar e Ordenar
    const allSanctions = [...activePunishments, ...activeInfractions];
    allSanctions.sort((a, b) => a.expiresAt - b.expiresAt);

    return allSanctions;
}

module.exports = {
    customId: 'mod_ver_punicoes_ativas',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const activeSanctions = await getActiveSanctions(interaction.guild.id);

        await interaction.editReply({
            components: generateModeracaoPunicoesAtivasMenu(activeSanctions, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    },
    getActiveSanctions // Exporta para ser usado pela paginação e revogação
};