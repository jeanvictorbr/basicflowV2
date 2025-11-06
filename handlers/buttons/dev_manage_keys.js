// CORREÇÃO 1: A importação agora é 'default', sem chaves {}
const generateDevKeysMenu = require('../../ui/devPanel/devKeysMenu'); 
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants'); // Adicionada V2_FLAG

module.exports = {
	customId: 'dev_manage_keys',
	async execute(interaction, client, db) {
		
		await interaction.deferUpdate();

		try {
			// O menu é gerado com a página 1 por padrão
			const { embeds, components } = await generateDevKeysMenu(db, 1); 
		
			await interaction.editReply({
				embeds: embeds,
				components: components,
				// CORREÇÃO 2: Ambas as flags são necessárias para manter a UI V2
				flags: EPHEMERAL_FLAG | V2_FLAG 
			});

		} catch (error) {
			console.error('Erro ao gerar menu de chaves:', error);
			await interaction.editReply({
				content: '❌ Ocorreu um erro ao carregar o menu de chaves. Verifique os logs.',
				components: [],
				embeds: [],
				// CORREÇÃO 2: Ambas as flags são necessárias, mesmo em erro
				flags: EPHEMERAL_FLAG | V2_FLAG 
			});
		}
	}
};