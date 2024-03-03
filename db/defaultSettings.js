// db/defaultSettings.js

const { LogLevel, log, assetPath } = require('../src/import');

/**
 * Generates default embed settings using images from website.
 * 
 * @returns {Object} The default settings for an embed.
 */
function getDefaultEmbedSettings() {
    return {
        color: "#1596e9",
        footer: {
            text: "Suggex: Catch & Patch ⋆ suggexbot.io",
            iconURL: assetPath +'suggex_logo.png'
        },
        thumbnail: assetPath +'suggex_thumb.png',
        image: assetPath +'suggex_image.png',
        author: {
            name: "Suggex",
            iconURL: assetPath +'suggex_logo.png',
        },
        url: 'https://suggexbot.io',
    }
}

function getDefaultModalSettings() {
    return {
        components: [
            {
                type: 'TEXT_INPUT', // Type of the component
                customId: 'textInput1', // Identifier for this component
                label: 'Your First Question', // Label shown above the input
                style: 'SHORT', // Can be 'SHORT' for a single-line input or 'PARAGRAPH' for multi-line
                minLength: 1, // Minimum input length
                maxLength: 100, // Maximum input length
                placeholder: 'Type your answer here...', // Placeholder text shown in the input field
                required: true, // Whether this field must be filled to submit the modal
            },
            {
                type: 'TEXT_INPUT',
                customId: 'textInput2',
                label: 'Your Second Question',
                style: 'PARAGRAPH',
                minLength: 1,
                maxLength: 500,
                placeholder: 'Type your answer here...',
                required: false, // This field is optional
            }
            // Add more components as needed
        ]
    };
}

module.exports = {
    getDefaultEmbedSettings,
    getDefaultModalSettings,
};