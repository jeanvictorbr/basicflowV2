const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

try {
    registerFont(path.join(__dirname, '../assets/fonts/Poppins-Bold.ttf'), { family: 'Poppins', weight: 'bold' });
    registerFont(path.join(__dirname, '../assets/fonts/Poppins-Regular.ttf'), { family: 'Poppins', weight: 'regular' });
} catch (e) {}

const RANK_ICONS = {
    1: 'https://cdn-icons-png.flaticon.com/512/2583/2583344.png',
    2: 'https://cdn-icons-png.flaticon.com/512/2583/2583319.png',
    3: 'https://cdn-icons-png.flaticon.com/512/2583/2583434.png',
};

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === 'undefined') stroke = true;
    if (typeof radius === 'undefined') radius = 5;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

function shortText(ctx, text, maxWidth) {
    let short = text;
    if (ctx.measureText(short).width > maxWidth) {
        while (ctx.measureText(short + '...').width > maxWidth) {
            short = short.slice(0, -1);
        }
        short += '...';
    }
    return short;
}

// ADICIONADO: Parâmetros page e totalPages
async function generateRanking(data, guildName, page = 1, totalPages = 1) {
    const width = 900;
    const height = 850;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // --- 1. FUNDO PREMIUM DARK COM NEVE ---
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, 600);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; 
    for(let i=0; i<100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 2.5; 
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2);
        ctx.fill();
    }

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, width, height);

    // --- 2. CABEÇALHO ---
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px "Poppins", "Sans"';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#FFD700'; 
    ctx.shadowBlur = 10;
    ctx.fillText(`🏆 RANKING: ${guildName.toUpperCase()}`, width / 2, 70);
    ctx.shadowBlur = 0;

    // Subtítulo com Página
    ctx.fillStyle = '#FFD700';
    ctx.font = '18px "Poppins", "Sans"';
    ctx.fillText(`Top Membros Mais Ativos • Página ${page} de ${totalPages}`, width / 2, 105);

    // --- 3. LISTA DE USUÁRIOS ---
    let y = 160;
    const rowHeight = 65;

    for (let i = 0; i < data.length; i++) {
        const item = data[i];
        
        // CALCULA O RANK REAL BASEADO NA PÁGINA
        // Ex: Página 1 (i=0 -> rank 1). Página 2 (i=0 -> rank 11)
        const rank = ((page - 1) * 10) + (i + 1);

        // Fundo Zebra
        if (i % 2 !== 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
            roundRect(ctx, 50, y - 45, 800, 55, 10, true, false);
        }

        // Ícone ou Texto de Rank
        if (RANK_ICONS[rank]) {
            try {
                const medal = await loadImage(RANK_ICONS[rank]);
                ctx.drawImage(medal, 70, y - 50, 45, 45);
            } catch (e) {}
        } else {
            ctx.fillStyle = '#888';
            ctx.font = 'bold 28px "Poppins"';
            ctx.textAlign = 'center';
            ctx.fillText(`#${rank}`, 92, y - 15);
            ctx.textAlign = 'left'; // Reset para o nome não bugar
        }

        // Avatar
        const avatarSize = 44;
        const avatarX = 150;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, y - 27, avatarSize/2, 0, Math.PI*2);
        ctx.clip();
        try {
            const avatar = await loadImage(item.avatarUrl);
            ctx.drawImage(avatar, avatarX, y - 27 - (avatarSize/2), avatarSize, avatarSize);
        } catch(e) {
            ctx.fillStyle = '#555';
            ctx.fill();
        }
        ctx.restore();

        // Borda Dourada Top 3
        ctx.strokeStyle = rank <= 3 ? '#FFD700' : '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, y - 27, avatarSize/2, 0, Math.PI*2);
        ctx.stroke();

        // Nome
        ctx.textAlign = 'left';
        ctx.fillStyle = rank === 1 ? '#FFD700' : '#FFFFFF';
        ctx.font = rank <= 3 ? 'bold 24px "Poppins"' : '22px "Poppins"';
        
        const name = shortText(ctx, item.displayName, 400);
        ctx.fillText(name, 220, y - 20);

        // Tempo
        ctx.textAlign = 'right';
        ctx.fillStyle = '#4cd137'; 
        ctx.font = 'bold 22px "Poppins"';
        ctx.fillText(item.pointsStr, 830, y - 20);

        y += rowHeight;
    }

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '14px "Poppins"';
    ctx.fillText("Atualizado em tempo real • BasicFlow System", width / 2, height - 20);

    return canvas.toBuffer();
}

module.exports = { generateRanking };