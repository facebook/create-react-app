import config from '../config'
import { isAuthorised } from '../../../src/utils/auth'

export const initState = {
  auth: { isAuthorised: isAuthorised() },
  ...config.initial_state
}

export default initState
