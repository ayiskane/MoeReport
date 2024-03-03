// eventHandlers/interactionCreate.js

// Import the necessary logging utility functions
const { LogLevel, log } = require('../src/import');

/**
 * Event handler for processing interactions received by the bot.
 * This includes commands invoked by users. It checks if the interaction
 * is a command and then attempts to execute the corresponding command logic.
 */
module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Check if the interaction is a command
        if (!interaction.isCommand()) return;
        log(LogLevel.DEBUG, `Received command: ${interaction.commandName}`);
        
        // Attempt to retrieve the command based on the command name
        const command = interaction.client.commands.get(interaction.commandName);

        // If the command does not exist, log an error and send a reply to the interaction
        if (!command) {
            log(LogLevel.WARN, `Command not found: ${interaction.commandName}`);
            return interaction.reply({ content: 'Command not found!', ephemeral: true });
        }
        log(LogLevel.DEBUG, `Executing command: ${interaction.commandName}`);

        try {
            await command.execute(interaction);
            log(LogLevel.DEBUG, `Command executed successfully: ${interaction.commandName}`);
        } catch (error) {
            log(LogLevel.ERROR, `Error executing command ${interaction.commandName}: ${error}`);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }

    },
};
