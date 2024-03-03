// utils/modalUtil.js

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

/**
 * Creates a fully customizable modal with text input fields.
 * 
 * @param {Object} options - The options for creating the modal.
 * @param {string} options.customId - A unique identifier for the modal.
 * @param {string} options.title - The title of the modal.
 * @param {Array<Object>} options.questions - An array of question objects. Each object should have properties for customization.
 * @returns {ModalBuilder} The constructed modal ready to be presented to the user.
 */
function createModal(options) {
    const modal = new ModalBuilder()
        .setCustomId(options.customId)
        .setTitle(options.title);

    // Generate text input components for each question
    const components = options.questions.map(question => {
        const textInput = new TextInputBuilder()
            .setCustomId(question.customId)
            .setLabel(question.label)
            // Optional: Set a placeholder if provided
            .setPlaceholder(question.placeholder || '')
            // Optional: Set a minimum length if provided
            .setMinLength(question.minLength || 1)
            // Optional: Set a maximum length if provided
            .setMaxLength(question.maxLength || 4000)
            // Optional: Set whether this field is required; defaults to true if not specified
            .setRequired(question.required !== false) // Defaults to true unless explicitly set to false
            // Required: Set the style (short or paragraph) based on the question's style property
            .setStyle(TextInputStyle[question.style]);

        return new ActionRowBuilder().addComponents(textInput);
    });

    // Add all components to the modal
    modal.addComponents(components);

    return modal;
}

module.exports = { createModal };
