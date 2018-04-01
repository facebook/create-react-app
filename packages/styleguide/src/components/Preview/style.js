import { injectGlobal } from 'styled-components';

/* eslint-disable */
injectGlobal`
  .preview-grid {
    .grid {
      position: relative;
      z-index: 0;
      padding: .5em 0;
      background-color: rgba(0,0,0,0.08);
      border: 1px solid rgba(0,0,0,0.15);
    }
    .grid__col,
    *[class*='grid__col\-\-'] {
      position: relative;
      min-height: 1em;
      line-height: 1.5;
      background-color: rgba(0,0,0,0.1);
      background-clip: content-box;
    }
  }
`;
/* eslint-enable */
