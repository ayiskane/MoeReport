// db/guildSettings.js

const { Project, Post, Tag, TeamRole, ChannelCategory } = require('./dbTables');
const { LogLevel, log, guildId } = require('../src/import');
const { client } = require('../src/client');

/**
 * Checks if a guild member has any of the roles stored in the TeamRole model.
 * 
 * @param {GuildMember} member - The guild member to check roles for.
 * @returns {Promise<boolean>} - True if the member has any of the roles, false otherwise.
 */
async function memberHasTeamRole(member) {
    try {
        // Fetch all roles from the TeamRole model
        const teamRoles = await TeamRole.findAll({
            attributes: ['role_id'], // Adjusted to snake_case
            raw: true,
        });

        // Extract role IDs from the query result
        const teamRoleIds = teamRoles.map(role => role.role_id); // Adjusted to snake_case

        // Check if the member has any of the roles
        const hasRole = member.roles.cache.some(role => teamRoleIds.includes(role.id));

        return hasRole;
    } catch (error) {
        log(LogLevel.ERROR, `Error checking team roles for member ${member.id}: ${error.message}`);
        return false; // Return false in case of error to avoid false positives
    }
}

/**
 * Fetches forum tags for channels specified in ChannelCategory.
 * @returns {Promise<Array>} A promise that resolves to an array of tags data.
 */
async function getAllTags() {
    const allTagsData = [];

    try {
        const channelCategories = await ChannelCategory.findAll({
            attributes: ['channel_id'], // Adjusted to snake_case
            raw: true,
        });

        for (const { channel_id } of channelCategories) { // Adjusted to snake_case
            const tagsData = await getTags(channel_id); // Adjusted to snake_case
            allTagsData.push(...tagsData);
        }
    } catch (error) {
        log(LogLevel.ERROR, `Error fetching forum tags for channels: ${error.message}`);
    }

    return allTagsData;
}

/**
 * Fetches all tags inside a specific forum channel.
 * @param {string} channelId - The ID of the forum channel.
 * @returns {Promise<Array>} A promise that resolves to an array of tag data objects.
 */
async function getTags(channel_id) { // Adjusted to snake_case
    try {
        const channel = await client.channels.fetch(channel_id); // Adjusted to snake_case

        if (channel.type !== 'GUILD_FORUM') {
            log(LogLevel.DEBUG, `Channel ${channel_id} is not a forum channel.`); // Adjusted to snake_case
            return [];
        }

        return channel.appliedTags.map(tag => ({
            tag_id: tag.id, // Adjusted to snake_case
            tag_name: tag.name, // Adjusted to snake_case
            channel_id: channel_id, // Adjusted to snake_case
        }));
    } catch (error) {
        log(LogLevel.ERROR, `Error fetching tags for channel ${channel_id}: ${error.message}`); // Adjusted to snake_case
        return [];
    }
}

/**
 * Retrieves tag IDs and their corresponding channel IDs based on matching the project name to tag names.
 * @param {string} projectName - The name of the project.
 * @returns {Promise<Array>} A promise that resolves to an array of objects, each containing a tagId, tagName, and channelId.
 */
async function getTagIdsByProjectName(project_name) { // Adjusted to snake_case
    try {
        // Fetch tags that match the project name
        const matchingTags = await Tag.findAll({
            where: { tag_name: project_name }, // Adjusted to snake_case
            attributes: ['tag_id', 'tag_name', 'channel_id'], // Adjusted to snake_case
        });

        if (!matchingTags.length) {
            log(LogLevel.DEBUG, `No tags found matching the project name: ${project_name}.`); // Adjusted to snake_case
            return [];
        }

        // Format the data to include tag_id and channel_id
        const tagsData = matchingTags.map(tag => ({
            tag_id: tag.tag_id, // Adjusted to snake_case
            channel_id: tag.channel_id, // Adjusted to snake_case
        }));

        return tagsData;
    } catch (error) {
        log(LogLevel.ERROR, `Error fetching tags for project name ${project_name}: ${error.message}`); // Adjusted to snake_case
        return [];
    }
}

module.exports = { memberHasTeamRole, getAllTags, getTags, getTagIdsByProjectName, };