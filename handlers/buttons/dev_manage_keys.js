const generateDevKeysMenu = require('../../ui/devPanel/devKeysMenu'); // Importação 'default' (sem chaves)
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants');

module.exports = {
	customId: 'dev_manage_keys',
	async execute(interaction, client, db) {
		
		await interaction.deferUpdate();

		try {
			// 1. Gerar o payload V2 (agora passando o 'db' para a função)
			const v2Payload = await generateDevKeysMenu(db, 1);
		
			// 2. Enviar a resposta V2
			await interaction.editReply({
				// NUNCA use 'content' ou 'embeds' com V2_FLAG
				components: v2Payload.components, // Componentes V2 (botões)
				v2_embed: v2Payload.v2_embed,     // Embed V2 (type: 17)
				flags: EPHEMERAL_FLAG | V2_FLAG   // Flag V2 é OBRIGATÓRIA
			});

		} catch (error) {
			console.error('Erro ao gerar menu de chaves:', error);
			// Resposta de erro V2 (não pode usar 'content')
			await interaction.editReply({
				v2_embed: {
					type: 17,
					title: 'Erro Crítico',
					description: '❌ Ocorreu um erro ao carregar o menu de chaves. Verifique os logs.',
					color: 0xFF0000 // Vermelho
				},
				components: [],
				flags: EPHEMERAL_FLAG | V2_FLAG // Obrigatório manter a flag
			});
		}
	}
};