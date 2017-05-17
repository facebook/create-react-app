/* @flow */
import { applyStyles } from '../utils/dom/css';
import { footerStyle } from '../styles';

function createFooter(document: Document) {
  const div = document.createElement('div');
  applyStyles(div, footerStyle);
  div.appendChild(
    document.createTextNode(
      'This screen is visible only in development. It will not appear if the app crashes in production.'
    )
  );
  div.appendChild(document.createElement('br'));
  div.appendChild(
    document.createTextNode(
      'Open your browser’s developer console to further inspect this error.'
    )
  );
  return div;
}

export { createFooter };
