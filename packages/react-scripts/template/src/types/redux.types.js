// @flow
import type { LocalizationState } from 'reducers/localization.reducer';
import type { NetworkState } from 'reducers/network.reducer';
import type { SampleState } from 'reducers/sample.reducer'; // TODO: remove this line

export type Action = {|
  type: string,
  payload?: any,
  meta?: {},
  error?: any
|};

/* eslint-disable no-use-before-define */
export type ApiAction = {|
  type: string,
  payload?: {
    label?: string,
    method?: string,
    data?: {},
    url?: string,
    onSuccess?: (data: any, dispatch: Dispatch) => void,
    onError?: (error: any, dispatch: Dispatch) => void
  },
  meta?: {
    api: boolean
  },
  error?: any
|};

/* eslint-enable no-use-before-define */
export type ActionCreator = (...any) => Action;
export type ApiActionCreator = (...any) => ApiAction;
export type Dispatch = (action: Action | ApiAction) => any;

export type GetState = () => State;
type Next = (action: Action | ApiAction) => any;
type Store = {
  getState: GetState,
  dispatch: Dispatch
};

export type Middleware = (store: Store) => (next: Next) => (action: Action | ApiAction) => any;

export type State = {
  localization: LocalizationState,
  network: NetworkState,
  sample: SampleState // TODO: remove this line
}
