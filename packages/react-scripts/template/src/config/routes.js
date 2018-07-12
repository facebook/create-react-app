import React from 'react'
import RestrictedRoute from 'rmw-shell/lib/containers/RestrictedRoute'
import makeLoadable from 'rmw-shell/lib/containers/MyLoadable'
import makeSlimLoadable from 'rmw-shell/lib/containers/SlimLoadable'
import { Route } from 'react-router-dom'

const MyLoadable = (opts, preloadComponents) => makeLoadable({ ...opts, firebase: () => import('./firebase') }, preloadComponents)
const SlimLoadable = (opts) => makeSlimLoadable({ ...opts })


const AsyncDashboard = MyLoadable({ loader: () => import('../pages/Dashboard') })
const AsyncAbout = MyLoadable({ loader: () => import('../pages/About') })
const AsyncCompany = MyLoadable({ loader: () => import('../pages/Companies/Company') })
const AsyncCompanies = MyLoadable({ loader: () => import('../pages/Companies/Companies') }, [AsyncCompany])
const AsyncTask = MyLoadable({ loader: () => import('../pages/Tasks/Task') })
const AsyncTasks = MyLoadable({ loader: () => import('../pages/Tasks/Tasks') }, [AsyncTask])
const AsyncDocument = MyLoadable({ loader: () => import('../pages/Document') })
const AsyncCollection = MyLoadable({ loader: () => import('../pages/Collection') })
const AsyncLandingPage = SlimLoadable({ loader: () => import('../pages/LandingPage') })

const routes = [
  <Route path="/" exact component={AsyncLandingPage} />,
  <RestrictedRoute type='private' path="/dashboard" exact component={AsyncDashboard} />,
  <RestrictedRoute type='private' path="/about" exact component={AsyncAbout} />,
  <RestrictedRoute type='private' path="/companies" exact component={AsyncCompanies} />,
  <RestrictedRoute type='private' path="/companies/edit/:uid" exact component={AsyncCompany} />,
  <RestrictedRoute type='private' path="/companies/create" exact component={AsyncCompany} />,
  <RestrictedRoute type='private' path="/tasks" exact component={AsyncTasks} />,
  <RestrictedRoute type='private' path="/tasks/edit/:uid" exact component={AsyncTask} />,
  <RestrictedRoute type='private' path="/document" exact component={AsyncDocument} />,
  <RestrictedRoute type='private' path="/collection" exact component={AsyncCollection} />,
]


export default routes;