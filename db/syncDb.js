// db/syncDb.js

const { log, LogLevel } = require('../src/import');
const { Guild, GuildSetting, Channel, Role, Team, Thread, Tag, Post, } = require('./dbTables');
const { getChannelClass, getChannelAutoDelete, getEmbedSettings, getModalSettings, } = require('./guildSettings');
const { getDefaultEmbedSettings, getDefaultModalSettings } = require('./defaultSettings');

/**
 * Synchronizes all entities from Discord with the database.
 */
async function syncInit(client) {
    log(LogLevel.DEBUG, 'Starting initial synchronization...');
    try {
        const guilds = await client.guilds.fetch();
        await syncGuilds(guilds);
        await syncGuildSetting(guilds);

        guilds.forEach(async (guild) => {
            // await syncRoles(guild); broken for now
            // await syncTeams(guild);
            await syncChannels(client, guild.id);
        });

        log(LogLevel.INFO, 'Full synchronization completed successfully.');
    } catch (error) {
        log(LogLevel.ERROR, 'Error during full synchronization:', error);
    }
}

/**
 * Synchronizes guilds from Discord with the database.
 * @param {Collection<Snowflake, Guild>} guilds - Collection of Discord guilds.
 */
async function syncGuilds(guilds) {
    log(LogLevel.DEBUG, 'Starting guild synchronization...');
    try {
        guilds.forEach(async (guild) => {
            const guildData = {
                guild_id: guild.id,
                owner_id: guild.fetchOwner().id,
                is_premium: false,
            };

            await Guild.upsert(guildData);
            log(LogLevel.INFO, `Guild synchronized: ${guild.id}`);
        });
    } catch (error) {
        log(LogLevel.ERROR, `Error synchronizing guilds: ${error}`);
    }
}

/**
 * Synchronizes guild settings with the database.
 * @param {Collection<Snowflake, Guild>} guilds - Collection of Discord guilds.
 */
async function syncGuildSetting(guilds) {
    log(LogLevel.DEBUG, 'Starting synchronization of guild settings...');
    try {
        guilds.forEach(async (guild) => {
            const newEmbedSettings = await getEmbedSettings(guild.id);
            const newModalSettings = await getModalSettings(guild.id);
            const currentSetting = await GuildSetting.findByPk(guild.id);

            if (currentSetting) {
                // Update existing settings
                await currentSetting.update({
                    embed: newEmbedSettings || currentSetting.embed, // Preserve existing if null
                    modal: newModalSettings || currentSetting.modal, // Preserve existing if null
                });
                log(LogLevel.INFO, `Updated settings for guild ID: ${guild.id}`);
            } else {
                // Determine whether to use new settings or default settings
                const embedToUse = newEmbedSettings || getDefaultEmbedSettings();
                const modalToUse = newModalSettings || getDefaultModalSettings();

                // Create new settings record
                await GuildSetting.create({
                    guild_id: guild.id,
                    embed: embedToUse,
                    modal: modalToUse,
                });

                // Log accordingly
                if (newEmbedSettings || newModalSettings) {
                    log(LogLevel.INFO, `Created new settings for guild ID: ${guild.id}`);
                } else {
                    log(LogLevel.INFO, `Applied default settings for new guild ID: ${guild.id}`);
                }
            }
        });
        log(LogLevel.INFO, 'Successfully synchronized guild settings.');
    } catch (error) {
        log(LogLevel.ERROR, `Error during synchronization of guild settings: ${error}`);
    }
}

/**
 * Synchronizes channels for a given guild with the database.
 * @param {Guild} guild - The Discord guild object.
 */
async function syncChannels(client, guildId) {
    if (!client) {
        log(LogLevel.ERROR, "Client is undefined.");
        return;
    }
    log(LogLevel.DEBUG, `Starting channel synchronization for guild: ${guildId}`);

    try {
        const guild = await client.guilds.fetch(guildId);
        if (!guild) {
            log(LogLevel.ERROR, `Guild with ID ${guildId} not found.`);
            return;
        }

        const channels = await guild.channels.fetch();
        log(LogLevel.INFO, `Fetched ${channels.size} channels for guild: ${guild.name} (${guild.id})`);

        for (const [channelId, channel] of channels) {
            const channelClass = await getChannelClass(channelId);
            const channelData = {
                channel_id: channelId,
                guild_id: guild.id,
                channel_type: channel.type,
                channel_class: await getChannelClass(channelId) || 'normal_channel',
                channel_isAutodelete: await getChannelAutoDelete(channelId) || false,
            };

            await Channel.upsert(channelData);
            log(LogLevel.INFO, `Channel synchronized: ${channel.name} (${channelId})`);

            if (channelClass === 'support_channel' || channelClass === 'bug_channel') {
                log(LogLevel.DEBUG, `Channel ${channel.id} is classified as ${channelClass}.`);

                if (channel.type === 'GUILD_FORUM') {
                    log(LogLevel.INFO, `Syncing posts and tags for forum channel: ${channel.name} (${channel.id})`);
                    try {
                        await syncPosts(channel);
                        log(LogLevel.INFO, `Posts synchronized for forum channel: ${channel.name} (${channel.id})`);
                    } catch (error) {
                        log(LogLevel.ERROR, `Error syncing posts for forum channel: ${channel.name} (${channel.id}): ${error}`);
                    }

                    try {
                        await syncTags(channel);
                        log(LogLevel.INFO, `Tags synchronized for forum channel: ${channel.name} (${channel.id})`);
                    } catch (error) {
                        log(LogLevel.ERROR, `Error syncing tags for forum channel: ${channel.name} (${channel.id}): ${error}`);
                    }
                } else {
                    log(LogLevel.INFO, `Syncing threads for channel: ${channel.name} (${channel.id})`);
                    try {
                        await syncThreads(channel);
                        log(LogLevel.INFO, `Threads synchronized for channel: ${channel.name} (${channel.id})`);
                    } catch (error) {
                        log(LogLevel.ERROR, `Error syncing threads for channel: ${channel.name} (${channel.id}): ${error}`);
                    }
                }
            } else {
                log(LogLevel.DEBUG, `Channel ${channel.id} (${channel.name}) is not a support or bug channel. Skipping.`);
            }
        }
    } catch (error) {
        log(LogLevel.ERROR, `Error synchronizing channels for guild ${guildId}: ${error}`);
    }
}

/**
 * Synchronizes roles for a given guild with the database.
 * @param {Guild} guild - The Discord guild object.
 */
async function syncRoles(guild) {
    log(LogLevel.DEBUG, `Starting role synchronization for guild: ${guild.id}`);
    try {
        log(LogLevel.DEBUG, `Guild roles property: ${guild.roles}`);
        const roles = await guild.roles.fetch();
        for (const role of roles.values()) {
            const roleData = {
                role_id: role.id,
                guild_id: guild.id,
                role_permissions: role.permissions.bitfield.toString(),
            };

            await Role.upsert(roleData);
            log(LogLevel.INFO, `Role synchronized: ${role.id}`);
        }
    } catch (error) {
        log(LogLevel.ERROR, `Error synchronizing roles for guild '${guild.id}': ${error}`);
    }
}

/**
 * Synchronizes threads for a given channel with the database.
 * Note: This function assumes that threads are fetched as part of channel synchronization.
 * @param {TextChannel | NewsChannel} channel - The Discord channel object.
 */
async function syncThreads(channel) {
    const channelClass = await getChannelClass(channel.id);

    if (channelClass !== 'support_channel' && channelClass !== 'bug_channel') {
        log(LogLevel.WARN, `Attempted to sync threads for a channel with incompatible class: ${channel.id}`);
        return; // Exit the function early
    }

    log(LogLevel.DEBUG, `Starting thread synchronization for channel: ${channel.id}`);
    try {
        const threads = await channel.threads.fetch();
        for (const thread of threads.values()) {
            // Fetch the initial message in the thread
            const messages = await thread.messages.fetch({ limit: 1 });
            const firstMessage = messages.first();

            const content = {
                text: firstMessage.content,
                embeds: firstMessage.embeds,
                mentions: firstMessage.mentions,
                reactions: firstMessage.reactions,
            };

            const threadData = {
                thread_id: thread.id,
                channel_id: channel.id,
                thread_name: thread.name,
                thread_content: content,
                thread_status: thread.state,
            };

            await Thread.upsert(threadData);
            log(LogLevel.INFO, `Thread synchronized: ${thread.id}`);
        }
    } catch (error) {
        log(LogLevel.ERROR, `Error synchronizing threads for channel ${channel.id}: ${error}`);
    }
}

/**
 * Synchronizes teams for a given guild with the database.
 * @param {Guild} guild - The Discord guild object.
 */
async function syncTeams(guild) {
    log(LogLevel.DEBUG, `Starting team synchronization for guild: ${guild.id}`);
    try {
        const teams = await fetchTeamsForGuild(guild.id);
        for (const team of teams) {
            const teamData = {
                team_id: team.id,
                guild_id: guild.id,
                team_entity: '', // need to implement
            };

            await Team.upsert(teamData);
            log(LogLevel.INFO, `Team synchronized: ${team.id}`);
        }
    } catch (error) {
        log(LogLevel.ERROR, `Error synchronizing teams for guild ${guild.id}: ${error}`);
    }
}

/**
 * Synchronizes posts for a given channel with the database.
 * @param {TextChannel | NewsChannel | ForumChannel} channel - The Discord channel object.
 */
async function syncPosts(channel) {
    const channelClass = await getChannelClass(channel.id);
    if (channel.type !== 'GUILD_FORUM') {
        log(LogLevel.WARN, `Attempted to sync posts for a non-forum channel: ${channel.id}`);
        return; // Exit the function early
    }

    if (channelClass !== 'support_channel' && channelClass !== 'bug_channel') {
        log(LogLevel.WARN, `Attempted to sync posts for a channel with incompatible class: ${channel.id}`);
        return; // Exit the function early
    }

    log(LogLevel.DEBUG, `Starting post synchronization for forum channel: ${channel.id}`);
    try {
        const posts = await channel.threads.fetch();
        for (const post of posts.posts.values()) {
            const messages = await posts.messages.fetch({ limit: 1 });
            const firstMessage = messages.first();

            const postData = {
                post_id: post.id,
                channel_id: channel.id,
                post_content: {
                    text: firstMessage.content,
                    embeds: firstMessage.embeds,
                    mentions: firstMessage.mentions,
                    reactions: firstMessage.reactions,
                },
                post_status: post.status,
            };

            await Post.upsert(postData);
            log(LogLevel.INFO, `Post synchronized: ${post.id}`);
        }
    } catch (error) {
        log(LogLevel.ERROR, `Error synchronizing posts for channel ${channel.id}: ${error}`);
    }
}

/**
 * Synchronizes tags for a given forum channel with the database.
 * @param {ForumChannel} channel - The Discord forum channel object.
 */
async function syncTags(channel) {
    const channelClass = await getChannelClass(channel.id);
    if (channel.type !== 'GUILD_FORUM') {
        log(LogLevel.WARN, `Attempted to sync tags for a non-forum channel: ${channel.id}`);
        return; // Exit the function early
    }

    if (channelClass !== 'support_channel' && channelClass !== 'bug_channel') {
        log(LogLevel.WARN, `Attempted to sync tags for a channel with incompatible class: ${channel.id}`);
        return; // Exit the function early
    }

    log(LogLevel.DEBUG, `Starting tag synchronization for forum channel: ${channel.id}`);
    try {
        const tags = channel.availableTags;
        for (const tag of tags) {
            // Extract emoji information
            let emojiInfo = {};
            if (tag.emojiId && tag.emojiName) {
                // Custom emoji
                emojiInfo = {
                    id: tag.emojiId,
                    name: tag.emojiName,
                };
            } else if (tag.emoji) {
                // Unicode emoji
                emojiInfo = {
                    name: tag.emoji,
                };
            }

            const tagData = {
                tag_id: tag.id,
                channel_id: channel.id,
                tag_emoji: emojiInfo,
                tag_name: tag.name,
            };

            // Create or update tag in the database
            await Tag.upsert(tagData);
            log(LogLevel.INFO, `Tag synchronized: ${tag.id}`);
        }
    } catch (error) {
        log(LogLevel.ERROR, `Error synchronizing tags for forum channel ${channel.id}: ${error}`);
    }
}


module.exports = { syncInit, syncChannels, syncGuilds, syncGuildSetting, syncPosts, syncRoles, syncTags, syncTeams, syncThreads, };