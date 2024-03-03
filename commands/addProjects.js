// // commands/addProjects.js

const { SlashCommandBuilder } = require('discord.js');
const { LogLevel, log } = require('../src/import');
const { addProjects } = require('../db/guildSettings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addprojects')
        .setDescription('Adds new projects to the guild.')
        .addStringOption(option =>
            option.setName('projects')
                .setDescription('Enter project names separated by commas (e.g., Project1, Project2)')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.guild) {
            log(LogLevel.WARN, 'Attempted to use /addProjects outside of a guild context.');
            await interaction.reply({ content: 'This command can only be used in a guild.', ephemeral: true });
            return;
        }

        const projectsInput = interaction.options.getString('projects');
        const guildId = interaction.guild.id;
        const projectNames = projectsInput.split(',').map(name => name.trim()).filter(name => name !== '');

        log(LogLevel.DEBUG, `Guild ID: ${guildId} - Received /addProjects command with projects: ${projectsInput}`);

        try {
            await addProjects(guildId, projectNames);
            log(LogLevel.INFO, `Projects successfully added to guild ID: ${guildId}. Projects: ${projectsInput}`);

            const successEmbed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('Projects Added Successfully')
                .setDescription(`The following projects have been added: ${projectNames.join(', ')}`)
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        } catch (error) {
            log(LogLevel.ERROR, `Failed to add projects to guild ID: ${guildId}. Error: ${error}`);

            const errorEmbed = new EmbedBuilder()
                .setColor(0xED4245)
                .setTitle('Failed to Add Projects')
                .setDescription('An error occurred while attempting to add projects. Please try again later.')
                .setTimestamp();

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};