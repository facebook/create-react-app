/* @flow */
function removeNextBr(parent, component: ?Element) {
  while (component != null && component.tagName.toLowerCase() !== 'br') {
    component = component.nextElementSibling;
  }
  if (component != null) {
    parent.removeChild(component);
  }
}

function absolutifyCaret(component: Node) {
  const ccn = component.childNodes;
  for (let index = 0; index < ccn.length; ++index) {
    const c = ccn[index];
    // $FlowFixMe
    if (c.tagName.toLowerCase() !== 'span') {
      continue;
    }
    const _text = c.innerText;
    if (_text == null) {
      continue;
    }
    const text = _text.replace(/\s/g, '');
    if (text !== '|^') {
      continue;
    }
    // $FlowFixMe
    c.style.position = 'absolute';
    // $FlowFixMe
    removeNextBr(component, c);
  }
}

export { absolutifyCaret };
