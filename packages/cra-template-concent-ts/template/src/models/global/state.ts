function getInitialState() {
  return {
    someInfo: `overWrite built-in module global's state`,
  };
}

export type St = ReturnType<typeof getInitialState>;

export default getInitialState;
