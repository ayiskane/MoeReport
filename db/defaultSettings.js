// db/defaultSettings.js

const { LogLevel, log, assetPath } = require('../src/import');

/**
 * Generates default embed settings using images from website.
 * 
 * @returns {Object} The default settings for an embed.
 */
function getDefaultEmbedSettings() {
    return {
        color: "#655E8F",
        footer: {
            text: "Elevate Your Gameplay ▰ fbi.moe",
            iconURL: assetPath +'moe_icon_256.png'
        },
        thumbnail: assetPath +'moe_icon.png',
        image: assetPath +'moe_image.png',
        author: {
            name: "Moe Reports",
            iconURL: assetPath +'moe_icon_256.png',
        },
        url: 'https://fbi.moe',
    }
}

module.exports = {
    getDefaultEmbedSettings,
};