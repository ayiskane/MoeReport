// utils/buttonUtil.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

/**
 * Creates a row of buttons for Discord messages.
 * @param {Array} buttonsData - An array of objects representing each button's data.
 * @returns {ActionRowBuilder} The created row of buttons.
 */
function createButtonsRow(buttonsData) {
    const row = new ActionRowBuilder();
    buttonsData.forEach(button => {
        row.addComponents(new ButtonBuilder()
            .setCustomId(button.customId)
            .setLabel(button.label)
            .setStyle(ButtonStyle[button.style]));
    });
    return row;
}

module.exports = { createButtonsRow };
