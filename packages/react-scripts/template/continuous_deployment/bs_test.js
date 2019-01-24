var webdriver = require('selenium-webdriver')

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports.runTest = async driver => {
  try {
    await driver.get('https://www.react-most-wanted.com')

    var signInButton = driver.wait(webdriver.until.elementLocated(webdriver.By.name('signin')))
    var passwordButton = driver.wait(
      webdriver.until.elementLocated(
        webdriver.By.className(
          'firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised firebaseui-idp-password firebaseui-id-idp-button'
        )
      )
    )
    var emailInput = driver.wait(webdriver.until.elementLocated(webdriver.By.name('email')))
    var passwordInput = driver.wait(webdriver.until.elementLocated(webdriver.By.name('password')))
    var nextButton = driver.wait(
      webdriver.until.elementLocated(
        webdriver.By.className(
          'firebaseui-id-submit firebaseui-button mdl-button mdl-js-button mdl-button--raised mdl-button--colored'
        )
      )
    )

    await signInButton.click()
    await sleep(2000)
    await passwordButton.click()
    await sleep(2000)
    await emailInput.sendKeys('test@test.com')
    await sleep(2000)
    await nextButton.click()
    await sleep(2000)
    await passwordInput.sendKeys('123456')
    await sleep(2000)
    await passwordInput.sendKeys(webdriver.Key.ENTER)
    await sleep(2000)
    driver.quit()
  } catch (e) {
    console.log('Test Failed')
    console.error(e)
    process.exitCode = 1
    process.abort()

    driver.quit()
  }
}
