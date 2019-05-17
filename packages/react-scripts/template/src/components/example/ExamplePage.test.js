import React from 'react'
import { render } from '@fs/zion-testing-library'
import ExamplePage from './ExamplePage'

test('renders with Frontier Application on the page', () => {
  const { getByText } = render(<ExamplePage />)
  const frontierApplication = getByText(/Frontier Application/i)
  expect(frontierApplication).toBeInTheDocument()
})
