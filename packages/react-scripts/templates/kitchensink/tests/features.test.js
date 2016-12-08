const fs = require('fs')
const jsdom = require('jsdom')
const path = require('path')

let resourcesResolver
let markup

if (process.env.E2E_FILE) {
  const file = path.isAbsolute(process.env.E2E_FILE)
    ? process.env.E2E_FILE
    : path.join(process.cwd(), process.env.E2E_FILE)

  markup = fs.readFileSync(file, 'utf8')

  resourcesResolver = resource => path.join(path.dirname(file), resource)
} else if (process.env.E2E_URL) {
//  jsdomConfig.url = process.env.E2E_URL
} else {
  it.only('can run jsdom (at least one of "E2E_FILE" or "E2E_URL" environment variables must be provided)', () => {
    expect(markup).toBeDefined()
  })
}

// eslint-disable-next-line no-undef
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

const initDOM = feature => new Promise(resolve => {
  const doc = jsdom.jsdom(markup, {
    features : {
      FetchExternalResources : ['script'],
      ProcessExternalResources : ['script'],
    },
    resourceLoader: (resource, callback) => {
      return callback(null, fs.readFileSync(resourcesResolver(resource.url.pathname), 'utf8'))
    },
    url: `http://localhost#${feature}`,
    virtualConsole: jsdom.createVirtualConsole().sendTo(console),
  })

  doc.defaultView.addEventListener('load', () => {
    setTimeout(() => resolve(doc), 0)
  }, false)
})

describe('Integration', () => {
  describe('Language syntax', () => {
    it('runs Promises', async () => {
      const doc = await initDOM('promises')

      expect(doc.getElementById('feature-promises').childElementCount).toBe(4)
    })

    it('runs generators', async () => {
      const doc = await initDOM('generators')

      expect(doc.getElementById('feature-generators').childElementCount).toBe(5)
    })

    it('runs async/await', async () => {
      const doc = await initDOM('async-await')

      expect(doc.getElementById('feature-async-await').childElementCount).toBe(4)
    })
  })
})
