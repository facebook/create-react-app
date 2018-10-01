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

  const moduleName =
    pathInsideSrc
      .split('/')
      .slice(-1)[0]
      .split('.')[0] || ''

  let finalisedFolderName =
    moduleName.startsWith('index') ||
    moduleName.startsWith('styles')
      ? parentFolderName
      : moduleName;

  return `${projectName}__${finalisedFolderName}__${localName}`;
}

module.exports = getLocalIdent
