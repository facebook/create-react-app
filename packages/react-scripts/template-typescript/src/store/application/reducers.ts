import { ReactNode } from 'react';
import { ILocales } from '../../intl/index';
import { isActionType } from '../../common/StrongAction'
import { ShowAlertAction, CloseAlertAction, SetLoadingAction } from './actions';

export interface ILoading
{
	visible: boolean,
	text?: string,
}

export interface IAlert
{
	title: string | ReactNode,
	content: string | ReactNode,
	visible: boolean,
}

export interface IApplicationState
{
	alert: IAlert,
	loading: ILoading,
	locale: ILocales,
}

const initialAlertState: IAlert = {
	title: '',
	content: '',
	visible: false,
}

const initialState: IApplicationState = {
	alert: initialAlertState,
	loading: {
		visible: false
	},
	locale: "zh-CN",
}

export default function applicationReducer(state = initialState, action): IApplicationState
{
	if (isActionType(action, SetLoadingAction))
	{
		return {
			...state,
			loading: action.payload
		}
	}
	else if (isActionType(action, ShowAlertAction))
	{
		return {
			...state,
			alert: action.payload
		}
	}
	else if (isActionType(action, CloseAlertAction))
	{
		return {
			...state,
			alert: initialAlertState
		}
	}
	return state
}