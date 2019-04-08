/**
 * @file Resolve the path to where the current app is mounted.
 * req.base() uses the ha-proxy headers that tell the app where it is should display
 * (fs.org, etc, instead of herokuapp)
 *
 * @require debug
 * @require url
 */

// Resolve the path to where the current app is mounted.
module.exports = () =>
  function resolver(req, res, next) {
    /**
     * Resolve path using req.base.
     * @param {string} dest - The path to the resource.
     *
     * @return {string} resolved path with req.base
     */
    req.resolvePath = (dest) => {
      // if it has a proto just return the path
      if (dest.match(/^http/)) return dest;
      // concatenate the paths
      const href = req.base + dest;
      return href;
    };
    next();
  };
