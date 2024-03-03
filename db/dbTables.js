// db/dbTables.js

// Import necessary modules from Sequelize for model definition
const { DataTypes, Model, Sequelize } = require('sequelize');
const { LogLevel, log } = require('../src/import');

// Initialize Sequelize with SQLite database configuration
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/moe.sqlite',
});

log(LogLevel.DEBUG, 'Defining Sequelize models...');