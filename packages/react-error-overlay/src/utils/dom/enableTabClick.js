/* @flow */
function enableTabClick(node: Element) {
  node.setAttribute('tabindex', '0');
  node.addEventListener('keydown', function(e: KeyboardEvent) {
    const { key, which, keyCode } = e;
    if (key === 'Enter' || which === 13 || keyCode === 13) {
      e.preventDefault();
      if (typeof e.target.click === 'function') {
        e.target.click();
      }
    }
  });
}

export { enableTabClick };
