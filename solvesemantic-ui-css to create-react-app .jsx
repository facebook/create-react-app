// The main reason for this is an extra ";" at line 19990 of semantic.css If removed, everything goes fine.

@font-face {
    font-family: 'Step';
    src: url(data:application/x-font-ttf;charset=utf-8;;base64,AAEAAAA... // this line
  }

  // While this solution works, I would caution that Semantic-UI has been unmaintained for several years now. Fomantic-UI is the community fork that is maintained and incorporates both bug fixes and additional features like toasts.

// FYI, this bug was recently discovered so it exists in the current release version of Fomantic-UI (2.8.8), but it has been fixed in the code base and tagged for the next release.
