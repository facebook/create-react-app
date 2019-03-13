import React from 'react'
import { render } from '@fs/testing-library'
import App from './App'

test('renders with Learn Frontier on the page', () => {
  const { getByText } = render(<App />)
  const learnFrontier = getByText(/learn frontier/i)
  expect(learnFrontier).toBeInTheDocument()
  expect(learnFrontier.href).toBe('https://www.familysearch.org/frontier/docs/#/')
})
