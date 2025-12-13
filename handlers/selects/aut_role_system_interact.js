// handlers/selects/aut_role_system_interact.js
const { PermissionsBitField } = require('discord.js');

module.exports = {
    customId: 'aut_role_system_interact',
    async execute(interaction) {
        // 1. Resposta Rápida (Ephemeral)
        await interaction.deferReply({ ephemeral: true });

        const member = interaction.member;
        const selectedRoleIds = interaction.values; // O que foi clicado

        const added = [];
        const removed = [];
        const errors = [];

        try {
            // --- LÓGICA DE TOGGLE (INTERRUPTOR) ---
            for (const roleId of selectedRoleIds) {
                const role = interaction.guild.roles.cache.get(roleId);
                if (!role) continue;

                if (member.roles.cache.has(roleId)) {
                    // JÁ TEM -> REMOVE
                    try {
                        await member.roles.remove(role);
                        removed.push(role.name);
                    } catch (e) {
                        errors.push(role.name);
                    }
                } else {
                    // NÃO TEM -> ADICIONA
                    try {
                        await member.roles.add(role);
                        added.push(role.name);
                    } catch (e) {
                        errors.push(role.name);
                    }
                }
            }

            // --- FEEDBACK PARA O USUÁRIO ---
            let responseText = '';
            if (added.length > 0) responseText += `✅ **Adicionado:** ${added.join(', ')}\n`;
            if (removed.length > 0) responseText += `🗑️ **Removido:** ${removed.join(', ')}\n`;
            if (added.length === 0 && removed.length === 0) responseText = 'ℹ️ Nenhuma alteração de cargo feita.';
            if (errors.length > 0) responseText += `⚠️ **Erro:** Não pude alterar: ${errors.join(', ')} (Verifique minhas permissões)`;

            await interaction.editReply({ content: responseText, ephemeral: true });

            // --- O PULO DO GATO: RESETAR O MENU (DESTRAVAR) ---
            // Editamos a mensagem original enviando os mesmos componentes.
            // Isso força o Discord do usuário a "limpar" a seleção visual do menu.
            await interaction.message.edit({ 
                components: interaction.message.components 
            }).catch(() => {}); // Catch silencioso caso dê rate limit ou erro de API

        } catch (error) {
            console.error("Erro no Auto-Role:", error);
            await interaction.editReply({ content: '❌ Erro ao processar. Tente novamente.', ephemeral: true });
        }
    }
};