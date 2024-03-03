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
    role_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true,
        comment: 'The Discord role ID',
    },
    team_name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'support_team',
        comment: 'The name of the team this role is associated with',
    },
}, {
    sequelize,
    modelName: 'TeamRole',
    tableName: 'team_roles',
    timestamps: false,
});

// Log a debug message indicating the model has been defined
log(LogLevel.DEBUG, 'TeamRole model defined successfully.');

/**
 * ChannelCategory model definition.
 * This model stores information about Discord channels categorized as "suggestions" or "bugs".
 */
class ChannelCategory extends Model { }
ChannelCategory.init({
    channel_id: {
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
    sequelize,
    modelName: 'ChannelCategory',
    tableName: 'channel_categories',
    timestamps: false,
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
    tag_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the tag',
    },
    channel_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'channel_categories',
            key: 'channel_id',
        },
        comment: 'The Discord channel ID the tag is associated with',
    },
    tag_name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'The name of the tag',
    },
}, {
    sequelize,
    modelName: 'Tag',
    tableName: 'tags',
    timestamps: true,
});

// Log a debug message indicating the model has been defined
log(LogLevel.DEBUG, 'Tag model defined successfully.');

/**
 * Project model definition.
 * Represents a project with a unique ID, name, and description.
 */
class Project extends Model { }
Project.init({
    project_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Unique identifier for the project',
    },
    project_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        comment: 'The name of the project',
    },
    tag_ids: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON array containing associated tag IDs for the project',
    },
}, {
    sequelize,
    modelName: 'Project',
    tableName: 'projects',
    timestamps: true,
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
    project_id: {
        type: DataTypes.UUID,
        references: {
            model: 'projects',
            key: 'project_id',
        },
        allowNull: false,
        comment: 'The project this post is associated with',
    },
}, {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
    timestamps: true,
});

// Log a debug message indicating the model has been defined
log(LogLevel.DEBUG, 'Post model defined successfully.');

// Define relationships
Project.hasMany(Post, { foreignKey: 'project_id' });
Post.belongsTo(Project, { foreignKey: 'project_id' });
Post.belongsToMany(Tag, { through: 'PostTags', foreignKey: 'post_id' });
Tag.belongsToMany(Post, { through: 'PostTags', foreignKey: 'tag_id' });
Tag.belongsTo(ChannelCategory, { foreignKey: 'channel_id', as: 'channel' });
ChannelCategory.hasMany(Tag, { foreignKey: 'channel_id', as: 'tags' });

const sequelizeInstances = [Project, Post, Tag, TeamRole, ChannelCategory];

module.exports = {
    sequelizeInstances,
    Project,
    Post,
    Tag,
    TeamRole,
    ChannelCategory,
};