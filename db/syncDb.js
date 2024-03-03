// db/syncDb.js

const { log, LogLevel, guildId } = require('../src/import');
const { Project, Post, Tag, TeamRole, ChannelCategory, } = require('./dbTables');
// const { getChannelClass, getChannelAutoDelete, getEmbedSettings, getModalSettings, } = require('./guildSettings');
const { getDefaultEmbedSettings } = require('./defaultSettings');
