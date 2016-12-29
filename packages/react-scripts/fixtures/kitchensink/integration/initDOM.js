const fs = require('fs')
const http = require('http')
const jsdom = require('jsdom')
const path = require('path')

let getMarkup
let resourceLoader
// this value could be tweaked in order to let the resource
// retriever get every file and jsdom execute react
let timeToWaitForJsToExecute

if (process.env.E2E_FILE) {
  const file = path.isAbsolute(process.env.E2E_FILE)
    ? process.env.E2E_FILE
    : path.join(process.cwd(), process.env.E2E_FILE)

  const markup = fs.readFileSync(file, 'utf8')
  getMarkup = () => markup

  resourceLoader = (resource, callback) => callback(
    null,
    fs.readFileSync(path.join(path.dirname(file), resource.url.pathname), 'utf8')
  )

  timeToWaitForJsToExecute = 0
} else if (process.env.E2E_URL) {
  getMarkup = () => new Promise(resolve => {
    http.get(process.env.E2E_URL, (res) => {
      let rawData = ''
      res.on('data', chunk => rawData += chunk)
      res.on('end', () => resolve(rawData))
    })
  })

  resourceLoader = (resource, callback) => {
    return resource.defaultFetch(callback)
  }

  timeToWaitForJsToExecute = 100
} else {
  it.only('can run jsdom (at least one of "E2E_FILE" or "E2E_URL" environment variables must be provided)', () => {
    expect(new Error('This isn\'t the error you are looking for.')).toBeUndefined()
  })
}

export default feature => new Promise(async resolve => {
  const markup = await getMarkup()
  const host = process.env.E2E_URL || 'http://localhost:3000'
  const doc = jsdom.jsdom(markup, {
    features : {
      FetchExternalResources : ['script', 'css'],
      ProcessExternalResources : ['script'],
    },
    resourceLoader,
    url: `${host}#${feature}`,
    virtualConsole: jsdom.createVirtualConsole().sendTo(console),
  })

  doc.defaultView.addEventListener('load', () => {
    setTimeout(() => resolve(doc), timeToWaitForJsToExecute)
  }, false)
})
