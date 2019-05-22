#!/usr/bin/env node

'use strict'

const commist = require('commist')()
const init = require('./lib/init')
const featureStart = require('./lib/feature/start')
const featurePublish = require('./lib/feature/publish')
const hotfixStart = require('./lib/hotfix/startHotfix')
const hotfixPublish = require('./lib/hotfix/endHotfix')
const help = require('./lib/utils/help')
const path = require('path')

require('make-promises-safe')
commist.register('init', init)
commist.register('feature start', featureStart)
commist.register('feature publish', featurePublish)
commist.register('hotfix start', hotfixStart)
commist.register('hotfix publish', hotfixPublish)

const res = commist.parse(process.argv.splice(2))

if (res) {
  // no command was recognized
  help(path.resolve(__dirname, 'help.txt'))
}
