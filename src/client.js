// src/client.js

const { token, LogLevel, log } = require('./import.js');
const { registerEventHandlers } = require('./registerEventHandlers');
const { registerCommands } = require('./registerCommands');
const { Client, GatewayIntentBits } = require('discord.js');
const { syncAllSequelizeInstances } = require('../db/db');
const { syncInit } = require('../db/syncDb.js');

/**
 * Initialize a new Discord client instance with specific intents.
 * Intents are necessary to define what events the client should receive.
 * This setup includes intents for guilds, guild messages, and message content.
 */
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.AutoModerationExecution,
        GatewayIntentBits.GuildIntegrations,

    ]
});

log(LogLevel.INFO, 'Initializing bot...');

// Register all event handlers
registerEventHandlers(client);
log(LogLevel.INFO, 'Event handlers registered.');

// Logs in to Discord using the bot token.
client.login(token).then(() => {
    log(LogLevel.INFO, 'Logged in successfully.');
}).catch((error) => {
    log(LogLevel.ERROR, `Failed to log in: ${error}`);
});

client.once('ready', async () => {
    // Once the client is ready, log a message indicating successful login
    log(LogLevel.INFO, `Ready State :: Logged in as ${client.user.tag}`);

    // Register commands after the client is ready if needed
    try {
        await registerCommands(client);
        log(LogLevel.INFO, 'All commands are successfully registered.');
    } catch (error) {
        log(LogLevel.ERROR, `Error registering commands: ${error}`);
    }

    try {
        await syncAllSequelizeInstances();
        console.log('Database synchronized successfully.');
    } catch (error) {
        console.error('Failed to synchronize database:', error);
        process.exit(1); // Exit with error
    }

    await syncInit(client);
});

module.exports = { client };