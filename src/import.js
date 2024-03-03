// src/import.js

require('dotenv').config();
const assetPath = 'https://suggexbot.io/assets/';
const { LogLevel, log } = require('../utils/logUtil');

module.exports = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    guildId: process.env.DISCORD_GUILD_ID,
    assetPath,
    LogLevel, 
    log,
};