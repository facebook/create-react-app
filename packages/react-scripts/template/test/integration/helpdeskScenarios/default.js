import { addScenario } from '@deskpro/apps-sdk/lib/Testing';

addScenario('default', {
  'context.me_get': {
    body: {
      id: 1,
      email: 'joe.kool@deskpro.com',
      name: 'Joe Kool',
    },
    status: 'success',
  },

  /**
     * @param {Array<String>} path the path to the property we want to get as a list of keys
     * @param {String} type the type of object
     * @param {String} tabId the id of the tab storing the data
     * @return {{body: *, status: string}}
     */
  'context.property.get': function({ path, type, tabId }) {
    return {
      body: 'my property',
      status: 'success',
    };
  },

  /**
     * @param {string} url the url of the request
     * @param {string} method the http method to use with the request
     * @param {Object} headers a map of headers to be sent with the request
     * @param {String} mode if set to 'cors' the request will be handled by the Deskpro Apps Proxy
     * @param {*} [body] the body of the request, if any
     * @return {{body: {status: number, body: {}, headers: {"Content-Type": string}}, status: string}}
     */
  'webapi.request.fetch': function({ url, method, headers, mode, body }) {
    return {
      body: {
        status: 200,
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
      },
      status: 'success',
    };
  },

  /**
     * @param {string} url the url of the request
     * @param {string} method the http method to use with the request
     * @param {Object} headers a map of headers to be sent with the request
     * @return {{body: {status: number, body: {}, headers: {"Content-Type": string}}, status: string}}
     */
  'webapi.request.deskpro': function({ url, method, headers, body }) {
    return {
      body: {
        status: 200,
        body: {
          your: 'payload',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      },
      status: 'success',
    };
  },

  /**
     * @param {string} provider the oauth provider name which should have been registered before
     * @param {string} protocolVersion the oauth version to use
     * @param {Object} [query] additional query parameters appended to the request url
     * @return {{body: {oauthVersion: *, body: {token: *}}, status: string}}
     */
  'security.authenticate.oauth': function({
    provider,
    protocolVersion,
    query,
  }) {
    const oauth2Token = {
      access_token: 'your access token',
      refresh_token: 'your refresh token',
      expires: 0,
      resource_owner_id: null,
    };

    const oauth1Token = {
      oauth_token: 'token',
      oauth_token_secret: 'secret',
    };

    const token = protocolVersion === '2.0' ? oauth2Token : oauth1Token;

    return {
      body: {
        oauthVersion: protocolVersion,
        body: {
          token,
        },
      },
      status: 'success',
    };
  },

  /**
     * @param {string} provider the oauth provider name which should have been registered before
     * @param {string} protocolVersion the oauth version to use
     * @param {Object} [query] additional query parameters appended to the request url
     * @return {{urlRedirect: string}}
     */
  'security.settings.oauth': function({ provider, protocolVersion, query }) {
    return {
      urlRedirect: `http://deskpro-dev/api/oauth/${protocolVersion}/${provider}/grant-access`,
    };
  },

  /**
     * @param {string} provider the oauth provider name which should have been registered before
     * @param {string} protocolVersion the oauth version to use
     * @param {Object} [query] additional query parameters appended to the request url
     * @return {{body: {oauthVersion: string, body: {token: *}}, status: string}}
     */
  'security.oauth.refresh': function({ provider, protocolVersion, query }) {
    const oauth2Token = {
      access_token: 'your access token',
      refresh_token: 'your refresh token',
      expires: 0,
      resource_owner_id: null,
    };

    const oauth1Token = {
      oauth_token: 'token',
      oauth_token_secret: 'secret',
    };

    const token = protocolVersion === '2.0' ? oauth2Token : oauth1Token;

    return {
      body: {
        oauthVersion: protocolVersion,
        body: {
          token,
        },
      },
      status: 'success',
    };
  },
});
