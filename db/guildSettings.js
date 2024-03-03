// db/guildSettings.js

const { Guild, GuildSetting, Project, Channel, Thread, Role, Team, Tag, Post, TeamUser, TeamRole } = require('./dbTables');
const { LogLevel, log } = require('../src/import');

/**
 * Retrieves the class of a channel by its ID.
 * @param {string} channelId - The ID of the channel.
 * @returns {Promise<string>} The class of the channel ('support_channel', 'bug_channel', etc.).
 */
async function getChannelClass(channelId) {
    log(LogLevel.DEBUG, `Fetching class for channel ID: ${channelId}`);

    try {
        const channel = await Channel.findOne({
            where: { channel_id: channelId },
            attributes: ['channel_id', 'channel_class'],
        });

        if (channel) {
            log(LogLevel.INFO, `Channel class for ID ${channelId}: ${channel.channel_class}`);
            return channel.channel_class;
        } else {
            log(LogLevel.WARN, `Channel with ID ${channelId} not found.`);
            return null; // Channel not found
        }
    } catch (error) {
        log(LogLevel.ERROR, `Error fetching channel class for channel ID ${channelId}: ${error}`);
        return null; // Return null in case of error
    }
}

/**
 * Retrieves the auto-delete setting for a channel by its ID from the database.
 * 
 * @param {string} channelId - The ID of the channel whose auto-delete setting is to be retrieved.
 * @returns {Promise<boolean|null>} The auto-delete setting of the channel if found, or null if not found or in case of error.
 */
async function getChannelAutoDelete(channelId) {
    log(LogLevel.DEBUG, `Fetching auto-delete setting for channel ID: ${channelId}`);

    try {
        const channel = await Channel.findOne({
            where: { channel_id: channelId },
            attributes: ['channel_id', 'channel_isAutodelete'],
        });

        if (channel) {
            log(LogLevel.INFO, `Auto-delete setting for channel ID ${channelId}: ${channel.channel_isAutodelete}`);
            return channel.channel_isAutodelete;
        } else {
            log(LogLevel.WARN, `Channel with ID ${channelId} not found.`);
            return null; // Channel not found
        }
    } catch (error) {
        log(LogLevel.ERROR, `Error fetching auto-delete setting for channel ID ${channelId}: ${error}`);
        return null; // Return null in case of error
    }
}

/**
 * Retrieves the embed settings for a specific guild.
 * 
 * @param {string} guildId - The ID of the guild whose embed settings are to be retrieved.
 * @returns {Promise<Object|null>} The embed settings object if found, or null if not found or in case of error.
 */
async function getEmbedSettings(guildId) {
    log(LogLevel.DEBUG, `Fetching embed settings for guild ID: ${guildId}`);

    try {
        const setting = await GuildSetting.findByPk(guildId);
        if (setting && setting.embed) {
            log(LogLevel.INFO, `Embed settings retrieved for guild ID: ${guildId}`);
            return setting.embed;
        } else {
            log(LogLevel.WARN, `No embed settings found for guild ID: ${guildId}`);
            return null;
        }
    } catch (error) {
        log(LogLevel.ERROR, `Error fetching embed settings for guild ID ${guildId}: ${error}`);
        return null;
    }
}

/**
 * Retrieves the modal settings for a specific guild.
 * 
 * @param {string} guildId - The ID of the guild whose modal settings are to be retrieved.
 * @returns {Promise<Object|null>} The modal settings object if found, or null if not found or in case of error.
 */
async function getModalSettings(guildId) {
    log(LogLevel.DEBUG, `Fetching modal settings for guild ID: ${guildId}`);

    try {
        const setting = await GuildSetting.findByPk(guildId);
        if (setting && setting.modal) {
            log(LogLevel.INFO, `Modal settings retrieved for guild ID: ${guildId}`);
            return setting.modal;
        } else {
            log(LogLevel.WARN, `No modal settings found for guild ID: ${guildId}`);
            return null;
        }
    } catch (error) {
        log(LogLevel.ERROR, `Error fetching modal settings for guild ID ${guildId}: ${error}`);
        return null;
    }
}

/**
 * Fetches projects for a specific guild from the database.
 * @param {string} guildId - The ID of the guild to fetch projects for.
 * @returns {Promise<Array>} An array of project objects.
 */
async function getProjects(guildId) {
    log(LogLevel.DEBUG, `Fetching projects for guild ID: ${guildId}`);

    try {
        const projects = await Project.findAll({
            where: { guild_id: guildId }
        });
        log(LogLevel.INFO, `Successfully fetched ${projects.length} projects for guild ID: ${guildId}`);

        return projects.map(project => project.toJSON()); // Convert Sequelize instances to plain objects
    } catch (error) {
        log(LogLevel.ERROR, `Error fetching projects for guild ID ${guildId}: ${error.message}`);
        return [];
    }
}

/**
 * Adds multiple projects to a guild, ensuring no duplicates.
 * @param {string} guildId - The ID of the guild.
 * @param {Array<string>} projectNames - An array of project names to add.
 */
async function addProjects(guildId, projectNames) {
    for (const projectName of projectNames) {
        try {
            const existingProject = await Project.findOne({
                where: { guild_id: guildId, project_name: projectName }
            });

            if (!existingProject) {
                await Project.create({
                    guild_id: guildId,
                    project_name: projectName
                });
                log(LogLevel.INFO, `Project "${projectName}" added to guild ID: ${guildId}.`);
            } else {
                log(LogLevel.WARN, `Project "${projectName}" already exists for guild ID: ${guildId}. Skipping.`);
            }
        } catch (error) {
            log(LogLevel.ERROR, `Error processing project "${projectName}" for guild ID: ${guildId}: ${error}`);
        }
    }
}

/**
 * Checks if a role or user ID belongs to any team in a guild.
 * @param {string} guildId - The ID of the guild.
 * @param {string} id - The role or user ID to check.
 * @returns {Promise<Array<string>|false>} - The names of the teams the ID belongs to, or false if none.
 */
async function isInTeam(guildId, id) {
    log(LogLevel.INFO, `Checking team membership for ID: ${id} in guild: ${guildId}`);

    // Check in TeamUser for a User ID
    try {
        const userTeams = await TeamUser.findAll({
            where: {
                guild_id: guildId,
                user_id: id,
            },
            include: [{
                model: Team,
                required: true,
            }]
        });

        if (userTeams.length > 0) {
            // User is in one or more teams, return the team names
            const teamNames = userTeams.map(teamUser => teamUser.Team.team_name);
            log(LogLevel.INFO, `User ID: ${id} is in teams: ${teamNames.join(', ')} in guild: ${guildId}`);
            return teamNames;
        }
    } catch (error) {
        log(LogLevel.ERROR, `Error checking user team membership for ID: ${id} in guild: ${guildId}: ${error}`);
    }

    // Check in TeamRole for a Role ID
    try {
        const roleTeams = await TeamRole.findAll({
            where: {
                guild_id: guildId,
                role_id: id,
            },
            include: [{
                model: Team,
                required: true,
            }]
        });

        if (roleTeams.length > 0) {
            // Role is in one or more teams, return the team names
            const teamNames = roleTeams.map(teamRole => teamRole.Team.team_name);
            log(LogLevel.INFO, `Role ID: ${id} is in teams: ${teamNames.join(', ')} in guild: ${guildId}`);
            return teamNames;
        }
    } catch (error) {
        log(LogLevel.ERROR, `Error checking role team membership for ID: ${id} in guild: ${guildId}: ${error}`);
    }

    // ID is not in any team
    log(LogLevel.INFO, `ID: ${id} does not belong to any team in guild: ${guildId}`);
    return false;
}

/**
 * Adds users or roles to a team.
 * 
 * @param {string} guildId - The ID of the guild.
 * @param {string} teamName - The name of the team.
 * @param {Array} mentionables - An array of mentionable objects, which can be users or roles.
 */
async function addToTeam(guildId, teamName, entityIds, entityType) {
    try {
        for (const entityId of entityIds) {
            if (entityType === 'user') {
                await TeamUser.create({
                    guild_id: guildId,
                    team_name: teamName,
                    user_id: entityId,
                });
                log(LogLevel.INFO, `Added user ${entityId} to team ${teamName} in guild ${guildId}.`);
            } else if (entityType === 'role') {
                await TeamRole.create({
                    guild_id: guildId,
                    team_name: teamName,
                    role_id: entityId,
                });
                log(LogLevel.INFO, `Added role ${entityId} to team ${teamName} in guild ${guildId}.`);
            } else {
                // Handle unexpected entity type
                log(LogLevel.WARN, `Unexpected entity type: ${entityType}`);
            }
        }
        return true;
    } catch (error) {
        log(LogLevel.ERROR, `Error adding entities to team in guild ${guildId}: ${error}`);
        return false;
    }
}

/**
 * Removes users or roles from a team.
 * 
 * @param {string} guildId - The ID of the guild.
 * @param {string} teamName - The name of the team.
 * @param {Array} mentionables - An array of mentionable objects, which can be users or roles.
 */
async function removeFromTeam(guildId, teamName, mentionables) {
    try {
        for (const mentionable of mentionables) {
            if (mentionable.user) {
                await TeamUser.destroy({
                    where: {
                        guild_id: guildId,
                        team_name: teamName,
                        user_id: mentionable.user.id,
                    },
                });
                log(LogLevel.INFO, `Removed user ${mentionable.user.tag} from team ${teamName} in guild ${guildId}.`);
            } else if (mentionable.role) {
                await TeamRole.destroy({
                    where: {
                        guild_id: guildId,
                        team_name: teamName,
                        role_id: mentionable.role.id,
                    },
                });
                log(LogLevel.INFO, `Removed role ${mentionable.role.name} from team ${teamName} in guild ${guildId}.`);
            } else {
                // Handle unexpected mentionable type
                log(LogLevel.WARN, `The mentionable type is not recognized.`);
            }
        }
        return true;
    } catch (error) {
        log(LogLevel.ERROR, `Error removing from team in guild ${guildId}: ${error}`);
        return false;
    }
}

module.exports = {
    getChannelClass,
    getChannelAutoDelete,
    getEmbedSettings,
    getModalSettings,
    getProjects,
    addProjects,
    isInTeam,
    addToTeam,
    removeFromTeam,
};