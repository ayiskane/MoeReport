// utils/logUtil.js

const LogLevel = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
};

/**
 * Logs a message with a given log level.
 * 
 * @param {LogLevel} level - The severity level of the log message.
 * @param {string} message - The message to log.
 * @param {string} [guildId] - Optional guild ID to include in the log message.
 */
function log(level, message, guildId = '') {
    const reset = '\x1b[0m'; // Reset ANSI escape code

    // Define ANSI escape codes for different background colors
    let background = '';
    switch (level) {
        case LogLevel.DEBUG:
            background = '\x1b[100m'; // Grey background
            break;
        case LogLevel.ERROR:
            background = '\x1b[41m'; // Red background
            break;
        case LogLevel.WARN:
            background = '\x1b[43m'; // Yellow background
            break;
        default:
            background = reset; // No background color for other levels
            break;
    }

    const now = new Date();
    const formattedDate = `${padZero(now.getDate())}/${padZero(now.getMonth() + 1)}/${now.getFullYear()}`;
    const formattedTime = `${padZero(now.getHours())}:${padZero(now.getMinutes())}:${padZero(now.getSeconds())}`;
    const formattedDateTime = `${formattedDate}\|\|${formattedTime}`;

    const guildPart = guildId ? `[${guildId}]` : '';
    console.log(`${background}${formattedDateTime}\|\|[${level}]${guildPart} ${message}`);
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

module.exports = { LogLevel, log };