// utils/captchaGenerator.js

/**
 * Gera um código CAPTCHA alfanumérico aleatório.
 * @param {number} length O comprimento do código.
 * @returns {string} O código CAPTCHA gerado.
 */
function generateCaptchaCode(length = 6) {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length)
        .toUpperCase();
}

module.exports = {
    generateCaptchaCode
};