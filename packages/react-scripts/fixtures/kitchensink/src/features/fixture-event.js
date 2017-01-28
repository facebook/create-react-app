export default doc => {
  const event = doc.createEvent('CustomEvent');
  event.initCustomEvent('fixture', true, true, {});
  doc.dispatchEvent(event);
}
