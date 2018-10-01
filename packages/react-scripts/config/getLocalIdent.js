'use strict'

const getLocalIdent = (context, localIdentName, localName) => {
  const projectNameMatches = /.*\/([^/]+)\/src|lib\/([^/]+)/.exec(
    context.resourcePath
  ) || [];

  const projectName =
    projectNameMatches[2] || projectNameMatches[1] || 'babylon';

  const pathInsideSrc = context.resourcePath.split(
    new RegExp(`${projectName}/(?:src/)?`, 'g')
  )[1] || context.resourcePath;

  const parentFolderName = pathInsideSrc ?
    pathInsideSrc.split('/').slice(-2, -1)[0] :
    context.resourcePath.split('/').slice(-2, -1)[0];

  const fileName =
    pathInsideSrc
      .split('/')
      .slice(-1)[0]
      .split('.')[0] || ''

  let moduleName =
    fileName.startsWith('index') ||
    fileName.startsWith('styles')
      ? parentFolderName
      : fileName;

  return `${projectName}__${moduleName}__${localName}`;
}

module.exports = getLocalIdent
