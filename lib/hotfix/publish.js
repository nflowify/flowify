const help = require('../utils/help')
const { readConfig } = require('../utils/config')
const parseArgs = require('./args')
const log = require('../utils/log')
const gitP = require('simple-git/promise')
const inquirer = require('inquirer')
const slugify = require('slugify')