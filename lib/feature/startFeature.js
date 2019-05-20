'use strict'

const help = require('../utils/help')
const { readConfig } = require('../utils/config')
const parseArgs = require('./args')
const log = require('../utils/log')
const gitP = require('simple-git/promise')
const inquirer = require('inquirer')
const slugify = require('slugify')

async function init (args) {
  let opts = parseArgs(args)
  if (opts.help) {
    return help(path.resolve(__dirname, 'help.txt'))
  }

  let config
  try {
    config = await readConfig(opts.directory)
  } catch (e) {
    log('error', e)
    process.exit(1)
  }

  if (!config.feature) {
    log('error', 'No feature branch provided')
    process.exit(1)
  }

  const git = gitP(opts.directory)
  await git.checkout(config.develop)

  let featureName = opts.name || ''
  if (!opts.name) {
    const prompt = inquirer.createPromptModule()
    const answers = await prompt([
      {
        type: 'input',
        name: 'featureName',
        message: 'Your feature name',
        default: 'my-feature',
        validate: function (answer) {
          if (answer === '') {
            return 'You need to specify a feature name'
          }
          return true
        }
      }
    ])
    featureName = answers.featureName
  }

  featureName = slugify(featureName)
  let brancheName
  try {
    brancheName = `${config.feature}/${featureName}`
    await git.checkoutBranch(brancheName, config.develop)
    await git.push(['-u', 'origin', brancheName])
  } catch (e) {
    log('error', `Can't checkout ${brancheName} from ${config.develop} branche`)
    process.exit(1)
  }

  log('success', `Feature branche ${brancheName} started!`)
}

function cli (args) {
  init(args)
}

module.exports = cli
