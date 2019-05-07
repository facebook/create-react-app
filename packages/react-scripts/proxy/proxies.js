// Usage:
//  uses http-proxy-middleware format
//  These configs override defaults in setupProxy, but please cascade defaults DRYly
//  See for config options: https://github.com/chimurai/http-proxy-middleware#http-proxy-options

// Tidiness:
//  Please keep these alphabetized by route
//  Please use as little config as possible
//  Please use the highest shared route for your service
//  If your service 404's or other non-301 at it's root,
//    please add a test object with testRoute and expectedCode
//    for the acceptance tests to verify against beta

// Schema: See Default Proxy Schema Readme here: https://github.com/fs-webdev/exo#proxy

const proxies = [
  {
    route: '/ark',
  },
  {
    route: '/ask',
  },
  {
    route: '/cis-web',
  },
  {
    route: '/frontier',
  },
  {
    route: '/hf',
  },
  {
    route: '/ident',
  },
  {
    route: '/mobile',
  },
  {
    route: '/platform',
  },
  {
    route: '/service',
  },
  {
    route: '/tf',
  },
]

module.exports = proxies
