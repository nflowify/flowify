#!/usr/bin/env node

'use strict'

const commist = require('commist')()
const init = require('./lib/init')
const startFeature = require('./lib/feature/startFeature')
const endFeature = require('./lib/feature/endFeature')
const startHotfix = require('./lib/hotfix/startHotfix')
const endHotfix = require('./lib/hotfix/endHotfix')
const help = require('./lib/utils/help')
const path = require('path')
require('make-promises-safe')

commist.register('init', init)
commist.register('start feature', startFeature)
commist.register('end feature', endFeature)
commist.register('start hotfix', startHotfix)
commist.register('end hotfix', endHotfix)

const res = commist.parse(process.argv.splice(2))

if (res) {
  // no command was recognized
  help(path.resolve(__dirname, 'help.txt'))
}
