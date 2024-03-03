// index.js

const { client } = require('./src/client');
const { LogLevel, log } = require('./src/import'); 

// Example of handling an error event
client.on('error', (error) => {
    log(LogLevel.ERROR, `An error occurred: ${error.message}`);
});

// Example of a debug message
client.on('debug', (info) => {
    log(LogLevel.DEBUG, `Debug info: ${info}`);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});