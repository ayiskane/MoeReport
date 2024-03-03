// src/registerCommands.js

const { REST, Routes, Collection, SlashCommandBuilder } = require('discord.js');
const { clientId, guildId, token, LogLevel, log } = require('./import');
const fs = require('fs');
const path = require('path');
const rest = new REST({ version: '10' }).setToken(token);

/**
 * Registers slash commands with Discord.
 * This function updates the bot's slash commands globally or for a specific guild.
 */
const registerCommands = async (client) => {
    client.commands = new Collection();
    const commands = [];
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    // Load command files and prepare them for registration
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if (command.data instanceof SlashCommandBuilder) {
            commands.push(command.data.toJSON());
            // Add the command to the client's collection for runtime usage
            client.commands.set(command.data.name, command);
            log(LogLevel.INFO, `Command loaded and registered: ${file}`);
        } else {
            log(LogLevel.WARN, `Command skipped (not an instance of SlashCommandBuilder): ${file}`);
        }
    }

    try {
        log(LogLevel.INFO, 'Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        log(LogLevel.INFO, 'Successfully reloaded application (/) commands.');
    } catch (error) {
        log(LogLevel.ERROR, `Failed to reload application (/) commands: ${error}`);
    }
};

module.exports = { registerCommands };