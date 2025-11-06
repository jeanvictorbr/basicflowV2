// CORREÇÃO 1: A importação agora é 'default', sem chaves {}
const generateDevKeysMenu = require('../../ui/devPanel/devKeysMenu');
const { EPHEMERAL_FLAG, V2_FLAG } = require('../../utils/constants'); // Adicionada V2_FLAG

module.exports = {
	customId: 'dev_keys_page_', // Dynamic customId
	async execute(interaction, client, db) {
		
		let newPage = parseInt(interaction.customId.split('_').pop(), 10);
		if (isNaN(newPage) || newPage < 1) {
			newPage = 1; 
		}
		
		await interaction.deferUpdate();

		try {
			const { embeds, components } = await generateDevKeysMenu(db, newPage);
		
			await interaction.editReply({
				embeds: embeds,
				components: components,
				// CORREÇÃO 2: Ambas as flags são necessárias para manter a UI V2
				flags: EPHEMERAL_FLAG | V2_FLAG
			});

		} catch (error) {
			console.error('Erro ao gerar página do menu de chaves:', error);
			await interaction.editReply({
				content: '❌ Ocorreu um erro ao carregar a página. Verifique os logs.',
				components: [],
				embeds: [],
				// CORREÇÃO 2: Ambas as flags são necessárias, mesmo em erro
				flags: EPHEMERAL_FLAG | V2_FLAG
			});
		}
	}
};