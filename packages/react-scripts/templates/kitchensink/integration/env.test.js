import { expect } from 'chai'
import initDOM from './initDOM'

describe('Integration', () => {
  describe('Environment variables', () => {
    it('NODE_PATH', async () => {
      const doc = await initDOM('node-path')

      expect(doc.getElementById('feature-node-path').childElementCount).to.equal(4)
    })

    it('shell env variables', async () => {
      const doc = await initDOM('shell-env-variables')

      expect(doc.getElementById('feature-shell-env-variables').textContent).to.equal('fromtheshell.')
    })

    it('file env variables', async () => {
      const doc = await initDOM('file-env-variables')

      expect(doc.getElementById('feature-file-env-variables').textContent).to.equal('fromtheenvfile.')
    })
  })
})
