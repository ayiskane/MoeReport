// commands/removeFromTeam.js

const { SlashCommandBuilder } = require('discord.js');
const { removeFromTeam } = require('../db/guildSettings');
const { log, LogLevel } = require('../utils/logUtil');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removefromteam')
        .setDescription('Removes users or roles from a specified team.')
        .addStringOption(option =>
            option.setName('team')
                .setDescription('The name of the team to remove users or roles from')
                .setRequired(true)
                .addChoices(
                    { name: 'Admin Team', value: 'admin_team' },
                    { name: 'Dev Team', value: 'dev_team' },
                    { name: 'Support Team', value: 'support_team' }
                ))
        .addMentionableOption(option =>
            option.setName('mention')
                .setDescription('The user or role to remove from the team')
                .setRequired(true)),

    async execute(interaction) {
        const teamName = interaction.options.getString('team');
        const mentionable = interaction.options.getMentionable('mention');
        const guildId = interaction.guild.id;

        const mentionables = [mentionable];

        try {
            const success = await removeFromTeam(guildId, teamName, mentionables);
            if (success) {
                await interaction.reply(`Removed from team ${teamName}.`);
            } else {
                await interaction.reply(`Failed to remove from team ${teamName}. Check logs for details.`);
            }
        } catch (error) {
            log(LogLevel.ERROR, `Error removing from team in guild ${guildId}: ${error}`);
            await interaction.reply(`Failed to remove from team ${teamName}. Check logs for details.`);
        }
    },
};