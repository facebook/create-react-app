/* @flow */
function consumeEvent(e: Event) {
  e.preventDefault();
  if (typeof e.target.blur === 'function') {
    e.target.blur();
  }
}

export { consumeEvent };
