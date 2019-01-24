import config from '../config'

export const initState = {
  auth: { isAuthorised: false },
  ...config.initial_state
}

export default initState
