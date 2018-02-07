import { LocalizationState } from 'reducers/localization.reducer';
import { NetworkState } from 'reducers/network.reducer';

export type Action = {|
  type: string,
    payload ?: any,
    meta ?: {},
    error ?: any
      |};

/* eslint-enable no-use-before-define */
export type ActionCreator = (...any) => Action;
export type State = LocalizationState &
  NetworkState;;
export type Dispatch = (action: ActionCreator) => any;

export type GetState = () => State;
type Next = (action: ActionCreator) => any;
type Store = {
  getState: GetState,
  dispatch: Dispatch
};

export type Middleware = (store: Store) => (next: Next) => (action: Action | Array<Action>) => any;

export type ApiAction = {|
  type: string,
    payload ?: {
      label?: string,
      method?: string,
      url?: string,
      onSuccess: (data: any, dispatch: Dispatch) => void,
      onError: (error: any, dispatch: Dispatch) => void
  },
    meta ?: {
      api: boolean
    },
    error ?: any
      |};
