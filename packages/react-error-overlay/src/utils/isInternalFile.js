/* @flow */
function isInternalFile(sourceFileName: ?string, fileName: ?string) {
  return sourceFileName == null ||
    sourceFileName === '' ||
    sourceFileName.indexOf('/~/') !== -1 ||
    sourceFileName.indexOf('/node_modules/') !== -1 ||
    sourceFileName.trim().indexOf(' ') !== -1 ||
    fileName == null ||
    fileName === '';
}

export { isInternalFile };
