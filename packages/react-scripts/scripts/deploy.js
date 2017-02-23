const https = require('https');
require('../utils/loadEnv');

if (process.env.TC_HONEYBADGER_KEY) {
  console.log('Notifying HoneyBadger of a deploy.')
  https
    .request({
      protocol: 'https:',
      host: 'api.honeybadger.io',
      path: '/v1/deploys',
      method: 'POST',

    })
    .on('error',
        err => {
          console.log('Failed to notify HoneyBadger of deploy.');
          console.log(err);
          process.exit(1);
        })
    .end([ `deploy[environment]=${process.env.NODE_ENV}`
          , `deploy[revision]=${process.env.TC_CLIENT_BUILD_COMMIT}`
          , `api_key=${process.env.TC_HONEYBADGER_KEY}`
          ].join('&'),
           res => {
             console.log('HoneyBadger deployment notification successful.')
             process.exit(0);
           })
} else {
  console.log('TC_HONEYBADGER_KEY is not defined. Skipping HoneyBadger deployment notification.');
  process.exit(0);
}
