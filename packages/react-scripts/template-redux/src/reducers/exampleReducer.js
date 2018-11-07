export default function reduceTimestamp(state = {}, action) {
  switch (action.type) {
    case 'UPDATE_TIMESTAMP':
      return { ...state, timestamp: Date.now() };
    default:
      return state;
  }
}
