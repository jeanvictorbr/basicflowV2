// utils/messageSplitter.js

/**
 * Divide uma string longa em pedaços menores que o limite do Discord,
 * tentando quebrar em novas linhas para manter a formatação.
 * @param {string} text O texto a ser dividido.
 * @param {number} maxLength O comprimento máximo de cada pedaço. Padrão 2000.
 * @returns {string[]} Um array com os pedaços da mensagem.
 */
function splitMessage(text, { maxLength = 2000 } = {}) {
    if (text.length <= maxLength) {
        return [text];
    }

    const chunks = [];
    let currentChunk = '';

    const lines = text.split('\n');
    for (const line of lines) {
        if (currentChunk.length + line.length + 1 > maxLength) {
            chunks.push(currentChunk);
            currentChunk = '';
        }
        
        if (line.length > maxLength) {
            let tempLine = line;
            while (tempLine.length > 0) {
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk);
                    currentChunk = '';
                }
                const slice = tempLine.substring(0, maxLength);
                chunks.push(slice);
                tempLine = tempLine.substring(maxLength);
            }
        } else {
            if (currentChunk.length > 0) {
                currentChunk += '\n';
            }
            currentChunk += line;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}

module.exports = { splitMessage };