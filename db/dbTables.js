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

/**
 * TeamRole model definition.
 * This model stores information about Discord roles that are part of specific teams, such as "support_team".
 */
class TeamRole extends Model { }

TeamRole.init({
    // Define model attributes
    roleId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        comment: 'The Discord role ID',
    },
    teamName: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'support_team',
        comment: 'The name of the team this role is associated with',
    },
}, {
    // Model options
    sequelize, // Pass the sequelize instance
    modelName: 'TeamRole', // Define the model name
    tableName: 'team_roles', // Define the table name
    timestamps: false, // Disable automatic timestamp fields
});

// Log a debug message indicating the model has been defined
log(LogLevel.DEBUG, 'TeamRole model defined successfully.');

/**
 * ChannelCategory model definition.
 * This model stores information about Discord channels categorized as "suggestions" or "bugs".
 */
class ChannelCategory extends Model { }

ChannelCategory.init({
    // Define model attributes
    channelId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        comment: 'The Discord channel ID',
    },
    category: {
        type: DataTypes.ENUM,
        values: ['suggestions', 'bugs'],
        allowNull: false,
        comment: 'The category of the channel (either "suggestions" or "bugs")',
    },
}, {
    // Model options
    sequelize, // Pass the sequelize instance
    modelName: 'ChannelCategory', // Define the model name
    tableName: 'channel_categories', // Define the table name
    timestamps: false, // Disable automatic timestamp fields
});

// Log a debug message indicating the model has been defined
log(LogLevel.DEBUG, 'ChannelCategory model defined successfully.');

/**
 * Tag model definition.
 * Represents a tag that can be associated with a channel.
 * Includes an optional emoji representation and the tag name.
 */
class Tag extends Model { }

Tag.init({
    // Define model attributes
    tag_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the tag',
    },
    channel_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'The Discord channel ID the tag is associated with',
    },
    tag_emoji: {
        type: DataTypes.JSON,
        comment: 'Optional JSON field for storing emoji representation of the tag',
    },
    tag_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'The name of the tag',
    },
}, {
    // Model options
    sequelize, // Pass the sequelize instance
    modelName: 'Tag', // Define the model name
    tableName: 'tags', // Define the table name
    timestamps: true, // Enable automatic timestamp fields (createdAt and updatedAt)
});

// Log a debug message indicating the model has been defined
log(LogLevel.DEBUG, 'Tag model defined successfully.');

/**
 * Project model definition.
 * Represents a project with a unique ID, name, and description.
 */
class Project extends Model { }

Project.init({
    // Define model attributes
    projectId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the project',
    },
    projectName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'The name of the project',
    },
}, {
    // Model options
    sequelize, // Pass the sequelize instance
    modelName: 'Project', // Define the model name
    tableName: 'projects', // Define the table name
});

// Log a debug message indicating the model has been defined
log(LogLevel.DEBUG, 'Project model defined successfully.');

/**
 * Post model definition.
 * Represents a post with a unique ID, content, and status, associated with a specific project.
 */
class Post extends Model { }

Post.init({
    // Define model attributes
    post_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the post',
    },
    channel_id: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'The Discord channel ID the post is associated with',
    },
    post_content: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'The content of the post, stored as JSON',
    },
    post_status: {
        type: DataTypes.STRING,
        comment: 'The status of the post',
    },
    // Foreign key to Project
    projectId: {
        type: DataTypes.UUID,
        references: {
            model: Project,
            key: 'projectId',
        },
        allowNull: false,
        comment: 'The project this post is associated with',
    },
}, {
    // Model options
    sequelize, // Pass the sequelize instance
    modelName: 'Post', // Define the model name
    tableName: 'posts', // Define the table name
    timestamps: true, // Enable automatic timestamp fields (createdAt and updatedAt)
});

// Log a debug message indicating the model has been defined
log(LogLevel.DEBUG, 'Post model defined successfully.');

// Define the relationship to Project
Project.hasMany(Post, { foreignKey: 'projectId' });
Post.belongsTo(Project, { foreignKey: 'projectId' });

const sequelizeInstances = [Project, Post, Tag, TeamRole, ChannelCategory];

module.exports = {
    sequelizeInstances,
    Project,
    Post,
    Tag,
    TeamRole,
    ChannelCategory,
};