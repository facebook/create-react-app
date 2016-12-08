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
    it('array-destructuring', async () => {
      const doc = await initDOM('array-destructuring')

      expect(doc.getElementById('feature-array-destructuring').childElementCount).toBe(4)
    })

    it('array-spread', async () => {
      const doc = await initDOM('array-spread')

      expect(doc.getElementById('feature-array-spread').childElementCount).toBe(4)
    })

    it('async/await', async () => {
      const doc = await initDOM('async-await')

      expect(doc.getElementById('feature-async-await').childElementCount).toBe(4)
    })

    it('class properties', async () => {
      const doc = await initDOM('class-properties')

      expect(doc.getElementById('feature-class-properties').childElementCount).toBe(4)
    })

    it('computed properties', async () => {
      const doc = await initDOM('computed-properties')

      expect(doc.getElementById('feature-computed-properties').childElementCount).toBe(4)
    })

    it('custom interpolation', async () => {
      const doc = await initDOM('custom-interpolation')

      expect(doc.getElementById('feature-custom-interpolation').childElementCount).toBe(4)
    })

    it('default parameters', async () => {
      const doc = await initDOM('default-parameters')

      expect(doc.getElementById('feature-default-parameters').childElementCount).toBe(4)
    })

    it('destructuring and await', async () => {
      const doc = await initDOM('destructuring-and-await')

      expect(doc.getElementById('feature-destructuring-and-await').childElementCount).toBe(4)
    })

    it('generators', async () => {
      const doc = await initDOM('generators')

      expect(doc.getElementById('feature-generators').childElementCount).toBe(4)
    })

    it('object-destructuring', async () => {
      const doc = await initDOM('object-destructuring')

      expect(doc.getElementById('feature-object-destructuring').childElementCount).toBe(4)
    })

    it('object-spread', async () => {
      const doc = await initDOM('object-spread')

      expect(doc.getElementById('feature-object-spread').childElementCount).toBe(4)
    })

    it('promises', async () => {
      const doc = await initDOM('promises')

      expect(doc.getElementById('feature-promises').childElementCount).toBe(4)
    })

    it('rest + default', async () => {
      const doc = await initDOM('rest-and-default')

      expect(doc.getElementById('feature-rest-and-default').childElementCount).toBe(4)
    })

    it('rest parameters', async () => {
      const doc = await initDOM('rest-parameters')

      expect(doc.getElementById('feature-rest-parameters').childElementCount).toBe(4)
    })

    it('template interpolation', async () => {
      const doc = await initDOM('template-interpolation')

      expect(doc.getElementById('feature-template-interpolation').childElementCount).toBe(4)
    })
  })
})
