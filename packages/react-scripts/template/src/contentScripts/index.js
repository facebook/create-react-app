// If your extension doesn't need a content script, just leave this file empty

// This is an example of a script that will run on every page. This can alter pages
// Don't forget to change `matches` in manifest.json if you want to only change specific webpages
const allLinks = Array.from(document.querySelectorAll('a')).map(
  link => link.href
);

console.log('-'.repeat(30));
console.log(
  `These are all ${
    allLinks.length
  } links on the current page that have been printed by the Sample Create React Extension`
);
console.log(allLinks);
console.log('-'.repeat(30));
