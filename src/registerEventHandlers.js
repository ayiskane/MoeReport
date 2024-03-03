// src/registerEventHandlers.js

const fs = require('fs');
const path = require('path');
const { LogLevel, log } = require('./import');

/**
 * Dynamically registers event handlers for the Discord client.
 * It scans a specified directory for event handler files and registers each one.
 * 
 * @param {Client} client - The Discord client instance.
 */
const registerEventHandlers = (client) => {
    const eventHandlersPath = path.join(__dirname, '..', 'eventHandlers');
    log(LogLevel.INFO, 'Registering event handlers...');

    try {
        const eventFiles = fs.readdirSync(eventHandlersPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventHandlersPath, file);
            try {
                const eventHandler = require(filePath);
                // Check if the eventHandler is an object with an execute function
                if (typeof eventHandler.execute === 'function') {
                    if (eventHandler.once) {
                        // If the handler should be registered with client.once
                        client.once(eventHandler.name, (...args) => eventHandler.execute(...args, client));
                    } else {
                        // Regular event registration with client.on
                        client.on(eventHandler.name, (...args) => eventHandler.execute(...args, client));
                    }
                    log(LogLevel.INFO, `Successfully registered event handler: ${file}`);
                } else {
                    throw new Error(`The event handler for ${file} does not export an execute function.`);
                }
            } catch (error) {
                log(LogLevel.ERROR, `Error registering event handler: ${file}: ${error}`);
            }
        }
    } catch (error) {
        log(LogLevel.ERROR, `Failed to read event handlers directory: ${error}`);
    }
};

module.exports = { registerEventHandlers };