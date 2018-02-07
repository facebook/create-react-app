import { LocalizationState } from 'reducers/localization.reducer';
import { NetworkState } from 'reducers/network.reducer';

export type Action = {|
  type: string,
  payload?: {
    success?: (...any) => any,
    error?: (...any) => any,
    label?: string,
    method?: string,
    url?: string
  }
|};

/* eslint-disable no-use-before-define */
export type ThunkActionCreator = (...any) => Dispatch => mixed;
/* eslint-enable no-use-before-define */
export type ActionCreator = (...any) => Action;
export type State = LocalizationState &
  NetworkState;;
export type Dispatch = (action: ActionCreator | ThunkActionCreator) => any;

export type GetState = () => State;
type Next = (action: ActionCreator) => any;
type Store = {
  getState: GetState,
  dispatch: Dispatch
};

export type Middleware = (store: Store) => (next: Next) => (action: Action | Array<Action>) => any;
