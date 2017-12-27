/**
 * See ../README.md#js-error-reporting
 */

const getSentry = async () =>
  import(/* webpackChunkName: "raven-js" */ 'raven-js');

export default function sentry() {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    getSentry()
      .then(Raven => {
        Raven.config(process.env.SENTRY_DSN, {
          release: process.env.BUILD_NUM,
          environment: process.env.BRANCH,
        }).install();
      })
      .catch(error => {
        throw new Error(error);
      });
  }
}
