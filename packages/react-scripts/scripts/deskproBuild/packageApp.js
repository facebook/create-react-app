const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

function createExecutor(projectRoot, artifactName) {
  const realProjectRoot = fs.realpathSync(projectRoot);

  return function executor(resolve, reject) {
    const destination = path.resolve(realProjectRoot, 'build', artifactName);
    const source = path.resolve(realProjectRoot, 'build');

    const output = fs.createWriteStream(destination);

    const archive = archiver('zip', {
      store: true, // Sets the compression method to STORE.
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function() {
      console.log(
        destination + ' ready with ' + archive.pointer() + ' total bytes'
      );
      resolve();
    });

    output.on('error', function(err) {
      console.error(err);
      reject(err);
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function() {
      console.log('Data has been drained');
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        // log warning
        console.warn(e);
      } else {
        // reject a.k.a throw error
        reject(e);
      }
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
      // reject a.k.a throw error
      reject(err);
    });
    archive.pipe(output);

    archive.glob('**', { debug: true, cwd: source, ignore: [artifactName] });
    archive.finalize();
  };
}

/**
 * @param {string} projectRoot
 * @param {string} artifactName
 * @return {Promise}
 */
module.exports = function(projectRoot, artifactName) {
  return new Promise(createExecutor(projectRoot, artifactName));
};
