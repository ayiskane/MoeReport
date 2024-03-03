// commands/addToTeam.js

const { SlashCommandBuilder } = require('discord.js');
const { addToTeam } = require('../db/guildSettings');
const { LogLevel, log } = require('../src/import');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addtoteam')
        .setDescription('Adds users or roles to a team.')
        .addStringOption(option =>
            option.setName('team')
                .setDescription('The name of the team')
                .setRequired(true)
                .addChoices(
                    { name: 'Admin Team', value: 'admin_team' },
                    { name: 'Dev Team', value: 'dev_team' },
                    { name: 'Support Team', value: 'support_team' }
                ))
        .addMentionableOption(option =>
            option.setName('users')
                .setDescription('The users to add to the team')
                .setRequired(false))
        .addMentionableOption(option =>
            option.setName('roles')
                .setDescription('The roles to add to the team')
                .setRequired(false)),
    async execute(interaction) {
        log(LogLevel.DEBUG, `Executing /addtoteam command by ${interaction.user.tag}`);

        const guildId = interaction.guild.id;
        const teamName = interaction.options.getString('team');
        const usersMentionable = interaction.options.getMentionable('users', false);
        const rolesMentionable = interaction.options.getMentionable('roles', false);

        // Initialize arrays to hold user and role IDs
        const userIds = [];
        const roleIds = [];

        // Check if users were mentioned and push their IDs into the userIds array
        if (usersMentionable) {
            const users = Array.isArray(usersMentionable) ? usersMentionable : [usersMentionable];
            users.forEach(user => {
                // Assuming user is either a User or GuildMember object
                userIds.push(user.id);
            });
        }

        // Check if roles were mentioned and push their IDs into the roleIds array
        if (rolesMentionable) {
            // If it's a single mentionable, ensure it's treated as an array for consistency
            const roles = Array.isArray(rolesMentionable) ? rolesMentionable : [rolesMentionable];
            roles.forEach(role => {
                roleIds.push(role.id);
            });
        }

        if (userIds.length === 0 && roleIds.length === 0) {
            await interaction.reply({ content: 'Please mention at least one user or role.', ephemeral: true });
            return;
        }

        try {
            // Assuming addToTeam function takes guildId, teamName, an array of user IDs, and an array of role IDs
            const successUsers = userIds.length > 0 ? await addToTeam(guildId, teamName, userIds, 'user') : true;
            const successRoles = roleIds.length > 0 ? await addToTeam(guildId, teamName, roleIds, 'role') : true;

            if (successUsers && successRoles) {
                log(LogLevel.DEBUG, `Successfully added to team ${teamName}.`);
                await interaction.reply(`Added to team ${teamName}.`);
            } else {
                log(LogLevel.ERROR, `Failed to add to team ${teamName}.`);
                await interaction.reply(`Failed to add to team ${teamName}. Check logs for details.`);
            }
        } catch (error) {
            log(LogLevel.ERROR, `Error in /addtoteam command: ${error.message}`);
            await interaction.reply(`An error occurred while trying to add to team ${teamName}.`);
        }
    },
};