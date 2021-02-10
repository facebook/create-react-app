const bootstrap = () => {
  try {
    window.parent.postMessage(
      {
        action: 'APP_LOAD_ACK',
        payload: { src: window.location.pathname },
      },
      '*'
    );
  } catch (e) {
    console.log('failed to notify parent the app was loaded', e);
  }
};
export default bootstrap;
