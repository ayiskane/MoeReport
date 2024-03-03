// db/dbTables.js

// Import necessary modules from Sequelize for model definition
const { DataTypes, Model, Sequelize } = require('sequelize');
const { LogLevel, log } = require('../src/import');

// Initialize Sequelize with SQLite database configuration
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './db/suggexdb.sqlite',
});

log(LogLevel.DEBUG, 'Defining Sequelize models...');

/**
 * Guild model definition.
 * Represents a Discord guild (server) in the database.
 */
class Guild extends Model { }
Guild.init({
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false, unique: true },
    owner_id: DataTypes.STRING,
    is_premium: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { sequelize, modelName: 'Guild', timestamps: true });

/**
 * Guild setting model definition.
 * Represents the settings for a Discord server in the database.
 */
class GuildSetting extends Model { }
GuildSetting.init({
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false, unique: true },
    embed: { type: DataTypes.JSON },
    modal: { type: DataTypes.JSON },
}, { sequelize, modelName: 'GuildSetting', timestamps: true });

/**
 * Channel model definition.
 * Represents a Discord channel within a guild.
 */
class Channel extends Model { }
Channel.init({
    channel_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false, unique: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    channel_type: DataTypes.STRING, // e.g., 'text', 'voice'
    channel_class: { type: DataTypes.ENUM, values: ['support_channel', 'bug_channel', 'normal_channel']},
    channel_isAutodelete: DataTypes.BOOLEAN
}, { sequelize, modelName: 'Channel', timestamps: true });

/**
 * Role model definition.
 * Represents a Discord role within a guild.
 */
class Role extends Model { }
Role.init({
    role_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false, unique: true },
    guild_id: { type: DataTypes.STRING, allowNull: false },
    role_permissions: DataTypes.STRING,
}, { sequelize, modelName: 'Role', timestamps: true });

/**
 * Thread model definition.
 * Represents a Discord thread within a channel.
 */
class Thread extends Model { }
Thread.init({
    thread_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false, unique: true },
    channel_id: { type: DataTypes.STRING, allowNull: false },
    thread_name: DataTypes.STRING,
    thread_content: { type: DataTypes.JSON, defaultValue: {}, allowNull: false, },
    thread_status: DataTypes.STRING,
}, { sequelize, modelName: 'Thread', timestamps: true });

/**
 * Team model definition.
 * Represents a team within a guild, such as admin, dev, or support teams.
 */
class Team extends Model { }
Team.init({
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    team_name: {
        type: DataTypes.ENUM('admin_team', 'dev_team', 'support_team'),
        allowNull: false,
        primaryKey: true
    },
}, {
    sequelize,
    modelName: 'Team',
    timestamps: true,
});

/**
 * TeamRole Model
 * 
 * Represents the association between a team and its roles within a guild.
 */
class TeamRole extends Model { }
TeamRole.init({
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: null,
    },
    team_name: {
        type: DataTypes.ENUM('admin_team', 'dev_team', 'support_team'),
        allowNull: false,
        references: null,
    },
    role_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'TeamRole',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['guild_id', 'team_name', 'role_id']
        }
    ],
});

/**
 * TeamUser Model
 * 
 * Represents the association between a team and its users within a guild.
 */
class TeamUser extends Model { }
TeamUser.init({
    guild_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: null,
    },
    team_name: {
        type: DataTypes.ENUM('admin_team', 'dev_team', 'support_team'),
        allowNull: false,
        references: null,
    },
    user_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'TeamUser',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['guild_id', 'team_name', 'user_id'],
        }
    ],
});
/**
 * Tag model definition.
 * Represents a tag that can be associated with a channel.
 */
class Tag extends Model { }
Tag.init({
    tag_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    channel_id: { type: DataTypes.STRING, allowNull: false },
    tag_emoji: { type: DataTypes.JSON },
    tag_name: DataTypes.STRING,
}, { sequelize, modelName: 'Tag', timestamps: true });

/**
 * Post model definition.
 * Represents a post that can be associated with a channel.
 */
class Post extends Model { }
Post.init({
    post_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    channel_id: { type: DataTypes.STRING, allowNull: false },
    post_content: { type: DataTypes.JSON, defaultValue: {} },
    post_status: DataTypes.STRING,
}, { sequelize, modelName: 'Post', timestamps: true });

class Project extends Model { }
Project.init({
    guild_id: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    project_name: { type: DataTypes.STRING },
}, { sequelize, modelName: 'Project', timestamps: true });

log(LogLevel.INFO, 'All Sequelize models defined successfully.');

// Define model associations
Channel.Guild = Channel.belongsTo(Guild);
Role.Guild = Role.belongsTo(Guild);
Team.Guild = Team.belongsTo(Guild);
GuildSetting.Guild = GuildSetting.belongsTo(Guild);
Project.Guild = Project.belongsTo(Guild);

Thread.Channel = Thread.belongsTo(Channel);
Tag.Channel = Tag.belongsTo(Channel);
Post.Channel = Post.belongsTo(Channel);

Channel.Threads = Channel.hasMany(Thread);
Channel.Tags = Channel.hasMany(Tag);
Channel.Posts = Channel.hasMany(Post);

Guild.Channels = Guild.hasMany(Channel);
Guild.Roles = Guild.hasMany(Role);
Guild.Teams = Guild.hasMany(Team);
Guild.GuildSetting = Guild.hasOne(GuildSetting);
Guild.Projects = Guild.hasMany(Project);

Team.TeamRoles = Team.hasMany(TeamRole);
TeamRole.Team = TeamRole.belongsTo(Team);

Team.TeamUsers = Team.hasMany(TeamUser);
TeamUser.Team = TeamUser.belongsTo(Team);

// Export models and associations for use elsewhere in the application
const sequelizeInstances = [Guild, GuildSetting, Channel, Thread, Role, Team, Tag, Post, Project];

module.exports = {
    sequelize,
    sequelizeInstances,
    Guild,
    Role,
    Team,
    TeamRole,
    TeamUser,
    GuildSetting,
    Project,
    Channel,
    Thread,
    Tag,
    Post,
};