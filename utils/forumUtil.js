// utils/forumUtil.js
const { getGuildSetting } = require('../src/guildSettings');
const { logError, logSuccess } = require('../debug/logUtil');
const fetch = require('node-fetch');


/**
 * Creates a new thread in a specific forum channel based on the project and type.
 * The forum channel is fetched from the guild settings based on the type and project.
 * If necessary tags for the thread do not exist, they are created in the forum channel.
 * Two reactions are added to the thread after creation.
 * 
 * @param {Guild} guild - The guild object where the forum thread is to be created.
 * @param {Object} details - An object containing all necessary information for forum thread creation.
 */
async function createForumThread(guild, details) {
    try {
        // Fetch forum channel settings based on project and submission type
        const settings = await getGuildSetting(guild.id);
        const forumChannelMapping = settings.forumChannelMapping || {};
        const channelId = forumChannelMapping[`${details.projectName}_${details.submissionType}`];

        if (!channelId) {
            logError(guild.id, `Forum channel not found for project: ${details.projectName}, type: ${details.submissionType}`);
            return;
        }

        const channel = guild.channels.cache.get(channelId);
        if (!channel || !channel.isForum()) {
            logError(guild.id, `Channel with ID ${channelId} does not exist or is not a forum.`);
            return;
        }

        // Check and create tags associated with project and type if they don't exist
        let tagIds = [];
        const requiredTags = [details.projectName, details.submissionType];
        
        for (const tagName of requiredTags) {
            let tag = channel.availableTags.find(t => t.name === tagName);
            if (!tag) {
                // Create tag if it doesn't exist
                await createTagInForum(guild.id, channelId, tagName, client.token);
                // Re-fetch tags after creation to update local cache
                await channel.fetchAvailableTags();
                tag = channel.availableTags.find(t => t.name === tagName);
            }
            tagIds.push(tag.id);
        }

        // Create new post in the forum channel
        const messageContent = {
            content: details.body,
            allowedMentions: { parse: [] },
            components: [],
            attachments: [],
            flags: 0,
            tags: tagIds,
        };

        const message = await channel.send(messageContent);

        // Add two reactions to the new post
        await message.react('👍');
        await message.react('👎');

        logSuccess(guild.id, `New thread created successfully in forum channel ${channel.name}: ${details.title}`);
    } catch (error) {
      logError(guild.id ? guild.id : "GLOBAL", `Error creating new thread in forum: ${error.message}`);
    }
}

/**
 * Creates a tag in a forum channel.
 * @param {string} guildId - The ID of the guild where the forum channel resides.
 * @param {string} forumChannelId - The ID of the forum channel to create the tag in.
 * @param {string} tagName - The name of the tag to create.
 * @param {string} botToken - The bot token used for authentication.
 * @returns {Promise<void>}
 */
async function createTagInForum(guildId, forumChannelId, tagName, botToken) {
    const url = `https://discord.com/api/v10/guilds/${guildId}/channels/${forumChannelId}/forum-tags`;

    const body = {
        name: tagName,
        // Optionally, you can specify other properties for the tag
        // such as emoji_id, moderated, etc., according to the API documentation
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create tag: ${errorData.message}`);
    }

    console.log('Tag created successfully');
}

module.exports = { createForumThread };
