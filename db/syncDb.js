// db/syncDb.js

const { log, LogLevel, guildId } = require('../src/import');
const { Project, Post, Tag, TeamRole, ChannelCategory, } = require('./dbTables');
const { getAllTags, getTagIdsByProjectName, } = require('./guildSettings');
// const { getDefaultEmbedSettings } = require('./defaultSettings');

/**
 * Creates multiple Project entries in the database and associates them with tag IDs.
 */
async function initProjects() {
    const projectNames = [
        'Palworld (Normal)',
        'Palworld (AAC)',
        'EFT',
        'DayZ',
        'Fornite',
        'Rust',
        // Add more project names as needed
    ];

    try {
        // Sequentially create projects and associate tag IDs
        for (const name of projectNames) {
            // Create project without tags initially
            const project = await Project.create({ project_name: name }); // Adjusted to snake_case

            // Fetch tag IDs for the project name
            const tagIds = await getTagIdsByProjectName(name);

            // Update the project with the fetched tag IDs
            await project.update({ tag_ids: JSON.stringify(tagIds) }); // Adjusted to snake_case

            log(LogLevel.INFO, `Project ${name} created and associated with tags.`);
        }
    } catch (error) {
        log(LogLevel.ERROR, `Error creating projects and associating tags: ${error.message}`);
    }
}

/**
 * Creates multiple TeamRole entries in the database.
 */
async function initTeamRoles() {
    try {
        const teamRoles = await TeamRole.bulkCreate([
            { role_id: '1182111820929052672' }, // Adjusted to snake_case
            { role_id: '1180940115590267012' }, // Adjusted to snake_case
            { role_id: '1180949078494941355' }, // Adjusted to snake_case
            { role_id: '1184118546154917969' }, // Adjusted to snake_case
            { role_id: '1202460906257256488' }, // Adjusted to snake_case
        ]);
        log(LogLevel.INFO, `Successfully created ${teamRoles.length} TeamRoles.`);
    } catch (error) {
        if (error.errors) {
            error.errors.forEach(err => {
                log(LogLevel.ERROR, `Validation error for field ${err.path}: ${err.message}`);
            });
        } else {
            log(LogLevel.ERROR, `Error creating team roles: ${error.message}`);
        }
    }
}

/**
 * Creates multiple ChannelCategory entries in the database.
 */
async function initChannelCategories() {
    try {
        const channelCategories = await ChannelCategory.bulkCreate([
            { channel_id: '1206502666226901012', category: 'suggestions' }, // Adjusted to snake_case
            { channel_id: '1206502595506610187', category: 'bugs' }, // Adjusted to snake_case
            // Add more channel category objects as needed
        ]);
        log(LogLevel.INFO, `Successfully created ${channelCategories.length} ChannelCategories.`);
    } catch (error) {
        log(LogLevel.ERROR, `Error creating channel categories: ${error.message}`);
    }
}

/**
 * Synchronizes forum tags in the database.
 */
async function initTags() {
    try {
        const tagsData = await getAllTags();

        // Store the tags in the Tag model
        await Tag.bulkCreate(tagsData, { ignoreDuplicates: true });

        log(LogLevel.INFO, `Successfully synchronized ${tagsData.length} forum tags.`);
    } catch (error) {
        log(LogLevel.ERROR, `Error synchronizing forum tags: ${error.message}`);
    }
}

async function syncInit() {
    await initTeamRoles();
    await initChannelCategories();
    await initTags();
    await initProjects();
    log(LogLevel.INFO, 'Database initialization complete.');
}

// Call initializeDatabase at the appropriate time in your application's lifecycle
syncInit().catch(error => {
    log(LogLevel.ERROR, `Database initialization failed: ${error.message}`);
});

module.exports = {
    syncInit,
    initProjects,
    initTeamRoles,
    initChannelCategories,
    initTags,
};