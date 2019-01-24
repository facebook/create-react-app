// To run this script use this command
// node bs.js yourBSUserName yourBSKey

var webdriver = require('selenium-webdriver')
var test = require('./bs_test.js')

// Input capabilities
var iPhone = {
  browserName: 'iPhone',
  device: 'iPhone 7',
  realMobile: 'true',
  os_version: '10.3',
  'browserstack.user': process.argv[2],
  'browserstack.key': process.argv[3]
}

// var android = {
//   browserName: 'android',
//   device: 'Samsung Galaxy S8',
//   realMobile: 'true',
//   os_version: '7.0',
//   'browserstack.user': process.argv[2],
//   'browserstack.key': process.argv[3]
// }

var desktopFF = {
  browserName: 'Firefox',
  browser_version: '59.0',
  os: 'Windows',
  os_version: '10',
  resolution: '1024x768',
  'browserstack.user': process.argv[2],
  'browserstack.key': process.argv[3]
}

var desktopEdge = {
  browserName: 'Edge',
  browser_version: '16.0',
  os: 'Windows',
  os_version: '10',
  resolution: '1024x768',
  'browserstack.user': process.argv[2],
  'browserstack.key': process.argv[3]
}

var desktopIE = {
  browserName: 'Chrome',
  browser_version: '69.0',
  os: 'Windows',
  os_version: '10',
  resolution: '1024x768',
  'browserstack.user': process.argv[2],
  'browserstack.key': process.argv[3]
}

var iPhoneDriver = new webdriver.Builder()
  .usingServer('http://hub-cloud.browserstack.com/wd/hub')
  .withCapabilities(iPhone)
  .build()

// var androidDriver = new webdriver.Builder()
//   .usingServer('http://hub-cloud.browserstack.com/wd/hub')
//   .withCapabilities(android)
//   .build()

var desktopFFDriver = new webdriver.Builder()
  .usingServer('http://hub-cloud.browserstack.com/wd/hub')
  .withCapabilities(desktopFF)
  .build()

var desktopEdgeDriver = new webdriver.Builder()
  .usingServer('http://hub-cloud.browserstack.com/wd/hub')
  .withCapabilities(desktopEdge)
  .build()

var desktopIEDriver = new webdriver.Builder()
  .usingServer('http://hub-cloud.browserstack.com/wd/hub')
  .withCapabilities(desktopIE)
  .build()

test.runTest(iPhoneDriver)
//test.runTest(androidDriver)
test.runTest(desktopFFDriver)
test.runTest(desktopEdgeDriver)
test.runTest(desktopIEDriver)
