#!/usr/bin/env node

'use strict'

const commist = require('commist')()
const init = require('./lib/init')
const featureStart = require('./lib/feature/start')
const featurePublish = require('./lib/feature/publish')
const featureFinish = require('./lib/feature/finish')
const hotfixStart = require('./lib/hotfix/start')
const hotfixPublish = require('./lib/hotfix/finish')
const help = require('./lib/utils/help')
const path = require('path')

require('make-promises-safe')
commist.register('init', init)
commist.register('feature start', featureStart)
commist.register('feature publish', featurePublish)
commist.register('feature finish', featureFinish)
commist.register('hotfix start', hotfixStart)
commist.register('hotfix publish', hotfixPublish)

const res = commist.parse(process.argv.splice(2))

if (res) {
  // no command was recognized
  help(path.resolve(__dirname, 'help.txt'))
}
