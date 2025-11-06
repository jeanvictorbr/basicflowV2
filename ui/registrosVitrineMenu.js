// ui/registrosVitrineMenu.js

module.exports = async function generateRegistrosVitrineMenu(interaction, settings) {
    
    const canalVitrine = settings.registros_canal_vitrine ? `<#${settings.registros_canal_vitrine}>` : '`Não definido`';
    const imagemVitrine = settings.registros_imagem_vitrine ? '`Definida`' : '`Não definida`';

    return {
        "type": 17, "accent_color": 5763719,
        "components": [
            { "type": 10, "content": "## 🖼️ Configurar Vitrine de Registro" },
            { "type": 10, "content": "> Configure o painel (vitrine) onde os usuários iniciarão o processo de registro por aprovação." },
            
            { "type": 14, "divider": true, "spacing": 1 },

            {
                "type": 9, "accessory": { 
                    "type": 2, 
                    "style": 2, 
                    "label": "Definir Canal", 
                    "custom_id": "registros_set_canal_vitrine" // Botão para o Handler 3
                },
                "components": [{ "type": 10, "content": `> Canal da Vitrine: ${canalVitrine}` }]
            },
            {
                "type": 9, "accessory": { 
                    "type": 2, 
                    "style": 2, 
                    "label": "Definir Imagem", 
                    "custom_id": "registros_set_imagem_vitrine" // Botão para seu handler existente
                },
                "components": [{ "type": 10, "content": `> Imagem de Fundo: ${imagemVitrine}` }]
            },
            
            { "type": 14, "divider": true, "spacing": 1 },

            {
                "type": 1, "components": [
                    { 
                        "type": 2, 
                        "style": 1, 
                        "label": "Publicar Vitrine", 
                        "emoji": { "name": "🚀" }, 
                        "custom_id": "registros_publicar_vitrine", // Botão para seu handler existente
                        "disabled": !settings.registros_canal_vitrine 
                    }
                ]
            },

            { "type": 14, "divider": true, "spacing": 2 },
            { 
                "type": 1, "components": [
                    { 
                        "type": 2, 
                        "style": 2, 
                        "label": "Voltar", 
                        "emoji": { "name": "↩️" }, 
                        "custom_id": "open_registros_menu" // Volta para o menu principal de registros
                    }
                ] 
            }
        ]
    };
};