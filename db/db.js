// db/db.js

// Import necessary utilities and Sequelize model definitions
const { LogLevel, log } = require('../src/import');
const { sequelizeInstances } = require('./dbTables');

/**
 * Synchronizes a single Sequelize model with the database.
 * This involves creating the table if it does not exist and updating it if it does.
 * 
 * @param {Model} sequelizeInstance - The Sequelize model instance to be synchronized.
 */
async function syncSequelizeInstance(sequelizeInstance) {
    try {
        // Attempt to synchronize the model with the database
        await sequelizeInstance.sync();
        // Log a status message on successful synchronization
        log(LogLevel.INFO, `Sequelize instance synced successfully: ${sequelizeInstance.getTableName()}`);
    } catch (error) {
        // Log an error message if synchronization fails
        log(LogLevel.ERROR, `Error syncing ${sequelizeInstance.getTableName()}: ${error.message}`);
    }
}

/**
 * Synchronizes all Sequelize model instances with the database.
 * This is a bulk operation that handles synchronization for all defined models.
 */
async function syncAllSequelizeInstances() {
    try {
        // Use Promise.all to synchronize all models concurrently
        await Promise.all(sequelizeInstances.map(syncSequelizeInstance));
        // Log a status message on successful synchronization of all models
        log(LogLevel.INFO, 'All Sequelize instances synced successfully');
    } catch (error) {
        // Log an error message if any synchronization fails
        log(LogLevel.ERROR, `Error syncing Sequelize instances: ${error.message}`);
    }
}

module.exports = {
    syncAllSequelizeInstances, 
};