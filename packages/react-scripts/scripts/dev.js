'use strict';

// The dev server is the same as the start server except
// we are running in isolation with some APIs mocked.
process.env.DESKPRO_ENV = 'test';

require('./start');
