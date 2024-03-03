// utils/threadUtil.js

const { getGuildSetting } = require('../src/guildSettings');
const { logError, logSuccess } = require('../debug/logUtil');

/**
 * Creates a thread in a channel associated with the project and submission type, based on guild settings.
 * The thread will be named according to the project and submission type contained within the details,
 * and two reactions will be added to the initial message.
 * 
 * @param {Guild} guild - The guild object where the thread is to be created.
 * @param {Object} details - An object containing all necessary information for thread creation.
 * @param {string} details.projectName - The name of the project for which the submission is made.
 * @param {string} details.submissionType - The type of submission, e.g., 'Suggestion' or 'Bug'.
 * @param {string} details.title - The title for the thread, typically derived from modal input.
 * @param {string} details.description - The detailed description for the thread, typically derived from modal input.
 */
async function createThread(guild, details) {
    try {
        // Fetch channel settings based on project and submission type
        const settings = await getGuildSetting(guild.id);
        const channelMapping = settings.channelMapping || {};
        const channelId = channelMapping[`${details.projectName}_${details.submissionType}`];

        if (!channelId) {
            logError(guild.id, `Channel not found for project: ${details.projectName}, type: ${details.submissionType}`);
            return;
        }

        const channel = guild.channels.cache.get(channelId);
        if (!channel) {
            logError(guild.id, `Channel with ID ${channelId} does not exist.`);
            return;
        }

        // Format and create the thread
        const threadName = `${details.projectName}: ${details.submissionType} - ${details.title}`;
        
        const thread = await channel.threads.create({
            name: threadName,
            autoArchiveDuration: 60,
            reason: `${details.submissionType} submitted for project ${details.projectName}`,
        });

        // Send an initial message with description
        const initialMessage = await thread.send(details.description);

        // Add two reactions to the initial message
        await initialMessage.react('👍');
        await initialMessage.react('👎');

        logSuccess(guild.id, `Thread created successfully: ${threadName}`);
    } catch (error) {
        logError(guild.id ? guild.id : "GLOBAL", `Error creating thread: ${error.message}`);
    }
}

module.exports = { createThread };
