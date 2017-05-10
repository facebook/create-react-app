/* @flow */
function isInternalFile(url: string, sourceFileName: string | null | void) {
  return url.indexOf('/~/') !== -1 ||
    url.indexOf('/node_modules/') !== -1 ||
    url.trim().indexOf(' ') !== -1 ||
    sourceFileName == null ||
    sourceFileName.length === 0;
}

export { isInternalFile };
