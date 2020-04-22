import React from 'react'
import { Route, Redirect } from 'react-router-dom'

// Normalize all paths to not have trailing slashes even if they
// matched <Route> with one:
const FilterRouter = ({ children }) => (
	<Route
		// tslint:disable-next-line jsx-no-lambda
		render={({ location: { pathname, search, hash } }) =>
		{
			const searchObj = !!search ? new URLSearchParams(search) : null
			console.log('location', pathname, search, hash, searchObj)
			if (pathname !== '/' && pathname.slice(-1) === '/')
			{
				return <Redirect to={`${pathname.slice(0, -1)}${search}${hash}`} />
			}
			return children
		}}
	/>
)

export default FilterRouter
