import initDOM from './initDOM'

// eslint-disable-next-line no-undef
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

describe('Integration', () => {
  describe('Language syntax', () => {
    it('object spread', async () => {
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
