// Input: /User/dan/app/build/static/js/main.82be8.js
// Output: /static/js/main.js
module.exports = paths => function removeFileNameHash(fileName) {
  return fileName
    .replace(paths.appBuild, '')
    .replace(/\/?(.*)(\.\w+)(\.js|\.css)/, (match, p1, p2, p3) => p1 + p3);
};
