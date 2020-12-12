import {
  ICtx,
  IActionCtx,
  IAnyObj,
  MODULE_VOID,
  MODULE_DEFAULT,
  MODULE_GLOBAL,
  GetRootState,
  GetRootReducer,
  GetRootComputed,
} from 'concent';
import models from '../models';

const allModels = models;
type Models = typeof allModels;

export type RootState = GetRootState<Models>;

export type RootRd = GetRootReducer<Models>;

export type RootCu = GetRootComputed<Models>;

export type TGlobalSt = RootState[MODULE_GLOBAL];
export type Modules = keyof RootState;

/** ultil type based on actionCtx */
export type AC<
  M extends Modules,
  FullState extends IAnyObj = RootState[M]
> = IActionCtx<RootState, RootCu, M, CtxM<{}, M>, FullState>;
// ********************************
// ultil types based on Ctx
// ********************************

/** belong one module.  CtxM<P, M, Se, RefCu> */
export type CtxM<
  P = {},
  M extends Modules = MODULE_DEFAULT,
  Se = {},
  RefCu = {},
  Mp = {}
> = ICtx<RootState, RootRd, RootCu, P, {}, M, MODULE_VOID, Se, RefCu, Mp>;

/** belong one module，expand private state.  CtxMS<P, M, St, Se, RefCu>*/
export type CtxMS<
  P = {},
  M extends Modules = MODULE_DEFAULT,
  St = {},
  Se = {},
  RefCu = {},
  Mp = {}
> = ICtx<RootState, RootRd, RootCu, P, St, M, MODULE_VOID, Se, RefCu, Mp>;

/** belong one module, connect other modules.  CtxMConn<P, M, Conn, Se, RefCu> */
export type CtxMConn<
  P = {},
  M extends Modules = MODULE_DEFAULT,
  Conn extends Modules = MODULE_VOID,
  Se = {},
  RefCu = {},
  Mp = {}
> = ICtx<RootState, RootRd, RootCu, P, {}, M, Conn, Se, RefCu, Mp>;

/** belong one module，expand private state, connect other modules.  CtxMSConn<P, M, St, Conn, Se, RefCu>  */
export type CtxMSConn<
  P = {},
  M extends Modules = MODULE_DEFAULT,
  St = {},
  Conn extends Modules = MODULE_VOID,
  Se = {},
  RefCu = {},
  Mp = {}
> = ICtx<RootState, RootRd, RootCu, P, St, M, Conn, Se, RefCu, Mp>;

/** expand private state, connect other modules.  CtxMSConn<P, St, Conn, Se, RefCu>  */
export type CtxSConn<
  P = {},
  St = {},
  Conn extends Modules = MODULE_VOID,
  Se = {},
  RefCu = {},
  Mp = {}
> = ICtx<RootState, RootRd, RootCu, P, St, MODULE_DEFAULT, Conn, Se, RefCu, Mp>;

/** expand private state.  CtxMSConn<P, St, Conn, Se, RefCu>  */
export type CtxS<P = {}, St = {}, Se = {}, RefCu = {}, Mp = {}> = ICtx<
  RootState,
  RootRd,
  RootCu,
  P,
  St,
  MODULE_DEFAULT,
  MODULE_VOID,
  Se,
  RefCu,
  Mp
>;

/** connect other modules.  CtxConn<P, Conn, Se, RefCu> */
export type CtxConn<
  P = {},
  Conn extends Modules = MODULE_VOID,
  Se = {},
  RefCu = {},
  Mp = {}
> = ICtx<RootState, RootRd, RootCu, P, {}, MODULE_DEFAULT, Conn, Se, RefCu, Mp>;

/** default series, when no module specified, the component belong to $$default module by default */
export type CtxDe<P = {}, Se = {}, RefCu = {}, Mp = {}> = CtxM<
  P,
  MODULE_DEFAULT,
  Se,
  RefCu,
  Mp
>;
export type CtxDeS<P = {}, St = {}, Se = {}, RefCu = {}, Mp = {}> = CtxMS<
  P,
  MODULE_DEFAULT,
  St,
  Se,
  RefCu,
  Mp
>;
export type CtxDeSConn<
  P = {},
  St = {},
  Conn extends Modules = MODULE_VOID,
  Se = {},
  RefCu = {},
  Mp = {}
> = CtxMSConn<P, MODULE_DEFAULT, St, Conn, Se, RefCu, Mp>;
export type CtxDeConn<
  P = {},
  Conn extends Modules = MODULE_VOID,
  Se = {},
  RefCu = {},
  Mp = {}
> = CtxSConn<P, MODULE_DEFAULT, Conn, Se, RefCu, Mp>;

export type ItemsType<Arr> = Arr extends ReadonlyArray<infer E> ? E : never;

export type VoidPayload = null | void;

export type VoidPayloadMev =
  | VoidPayload
  | React.MouseEvent<HTMLButtonElement, MouseEvent>;
