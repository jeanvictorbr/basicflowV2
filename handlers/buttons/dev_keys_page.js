const { generateDevKeysMenu } = require('../../ui/devPanel/devKeysMenu');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
	customId: 'dev_keys_page_', // Dynamic customId
	async execute(interaction, client, db) {
		
		// CORREÇÃO (Erro 2): Adicionada verificação de NaN
		let newPage = parseInt(interaction.customId.split('_').pop(), 10);
		if (isNaN(newPage) || newPage < 1) {
			newPage = 1; // Garante que a página seja sempre um número válido
		}
		
		await interaction.deferUpdate();

		try {
			// CORREÇÃO (Erro 1): Desestruturação
			const { embeds, components } = await generateDevKeysMenu(db, newPage);
		
			await interaction.editReply({
				embeds: embeds,
				components: components,
				flags: EPHEMERAL_FLAG
			});

		} catch (error) {
			console.error('Erro ao gerar página do menu de chaves:', error);
			await interaction.editReply({
				content: '❌ Ocorreu um erro ao carregar a página. Verifique os logs.',
				components: [],
				embeds: [],
				flags: EPHEMERAL_FLAG
			});
		}
	}
};