import initDOM from './initDOM'

// eslint-disable-next-line no-undef
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

describe('Integration', () => {
  describe('Environment variables', () => {
    it('NODE_PATH', async () => {
      const doc = await initDOM('node-path')

      expect(doc.getElementById('feature-node-path').childElementCount).toBe(4)
    })

    it('shell env variables', async () => {
      const doc = await initDOM('shell-env-variables')

      expect(doc.getElementById('feature-shell-env-variables').textContent).toBe('fromtheshell.')
    })

    it('file env variables', async () => {
      const doc = await initDOM('file-env-variables')

      expect(doc.getElementById('feature-file-env-variables').textContent).toBe('fromtheenvfile.')
    })
  })
})
