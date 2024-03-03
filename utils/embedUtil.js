// utils/embedUtil.js

const { EmbedBuilder } = require('discord.js');
const { getEmbedSettings } = require('../src/guildSettings');
const { getDefaultEmbedSettings, logStatus, logDebug } = require('../src/config');

function createEmbed(options) {
    const embed = new EmbedBuilder()
        .setTitle(options.title)
        .setDescription(options.description)
        .setColor(options.color)
        .setFooter({
            text: options.footer?.text,
            iconURL: options.footer?.iconURL
        })
        .setThumbnail(options.thumbnail)
        .setImage(options.image)
        .setAuthor({
            name: options.author?.name,
            iconURL: options.author?.iconURL,
            url: options.author?.url
        });

    if (options.fields) embed.addFields(options.fields);
    if (options.addTimestamp) embed.setTimestamp();

    return embed;
}

/**
 * Creates a Discord embed using preset settings from the database, fallbacks from `getDefaultEmbedSettings`,
 * or options provided by the user. This allows for a high degree of customization while ensuring sensible defaults.
 * 
 * @param {string} guildId - The ID of the guild for which to create the embed. Used to fetch guild-specific settings.
 * @param {User} user - The Discord.js User object for the author of the embed. Used for default author settings.
 * @param {Object} options - The options for customizing the embed. User-provided settings take precedence.
 * @param {string} [options.title] - The title of the embed.
 * @param {string} [options.description] - The description of the embed.
 * @param {string} [options.color] - The color of the embed.
 * @param {Array}  [options.fields] - The fields to add to the embed.
 * @param {Object} [options.footer] - The footer of the embed, including text and iconURL.
 * @param {string} [options.thumbnail] - The URL of the thumbnail image.
 * @param {string} [options.image] - The URL of the main image.
 * @param {string} [options.url] - The URL the embed title should link to.
 * @param {Object} [options.author] - The author of the embed, including name, iconURL, and URL.
 * @param {boolean} [options.addTimestamp] - Whether to add a timestamp to the embed. Defaults based on settings or false.
 * @returns {Promise<EmbedBuilder>} A promise that resolves to the created embed, customized according to the provided options.
 */
async function createPresetEmbed(guildId, options) {
    // Fetch guild-specific settings and default settings
    const embedSettings = await getEmbedSettings(guildId) || {};
    const defaultSettings = getDefaultEmbedSettings();

    // Merge options, giving precedence to user-provided options, then guild settings, and finally default settings
    const finalOptions = {
        title: options.title,
        description: options.description,
        color: options.color || embedSettings.color || defaultSettings.color,
        footer: options.footer || embedSettings.footer || defaultSettings.footer,
        thumbnail: options.thumbnail || embedSettings.thumbnail || defaultSettings.thumbnail,
        image: options.image || embedSettings.image || defaultSettings.image,
        author: options.author || embedSettings.author || defaultSettings.author,
        url: options.url || embedSettings.url || defaultSettings.url,
    };

    // Add a timestamp if requested by any of the settings layers
    if (options.addTimestamp || embedSettings.addTimestamp || defaultSettings.addTimestamp) {
        finalOptions.addTimestamp = true;
    }
    if (options.fields || embedSettings.fields) finalOptions.fields = options.fields || embedSettings.fields;

    logDebug(finalOptions.thumbnail);
    return createEmbed(finalOptions);
}

/**
 * Sends an embed to a specified channel and adds reactions to the message.
 * @param {TextChannel | NewsChannel | ThreadChannel} channel - The channel to send the embed to.
 * @param {EmbedBuilder} embed - The embed to send.
 * @param {string[]} reactions - An array of emoji identifiers for reactions to add.
 * @returns {Promise<void>}
 */
// async function sendEmbedAndReact(channel, embed, reactions) {
//     // Ensure the channel is of a type that can receive messages
//     if (![ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread].includes(channel.type)) {
//         throw new Error('Provided channel does not support messages.');
//     }

//     try {
//         // Send the embed to the specified channel
//         const message = await channel.send({ embeds: [embed] });

//         // Add each reaction in sequence
//         for (const reaction of reactions) {
//             await message.react(reaction);
//         }
//     } catch (error) {
//         console.error('Failed to send embed or add reactions:', error);
//         throw error;
//     }
// }

module.exports = { createEmbed, createPresetEmbed };
