import React from 'react'
import { render } from '@fs/testing-library'
import Home from './Home'

test('renders with Learn Frontier on the page', () => {
  const { getByText } = render(<Home />)
  const learnFrontier = getByText(/learn frontier/i)
  expect(learnFrontier).toBeInTheDocument()
  expect(learnFrontier.href).toBe('https://www.familysearch.org/frontier/docs/#/')
})
