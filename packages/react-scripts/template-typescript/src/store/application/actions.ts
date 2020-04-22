import { ReactNode } from 'react';
import { TypeName, StrongAction } from '../../common/StrongAction'
import { IAlert, ILoading } from './reducers';

@TypeName('SET_LOADING')
export class SetLoadingAction extends StrongAction
{
	constructor(public payload: ILoading)
	{
		super();
	}
}

@TypeName('SHOW_ALERT')
export class ShowAlertAction extends StrongAction
{
	constructor(public payload: IAlert)
	{
		super();
	}
}

@TypeName('CLOSE_ALERT')
export class CloseAlertAction extends StrongAction
{
}

export interface IApplicationAction
{
	showLoading: (text?: string) => any;
	hideLoading: () => any;
	showAlert: (title: string | ReactNode, content: string | ReactNode) => any;
	closeAlert: () => any;
}

export const actionCreators: IApplicationAction = {
	showLoading: (text?: string): any => dispatch => dispatch(new SetLoadingAction({ visible: true, text })),
	hideLoading: (): any => dispatch => dispatch(new SetLoadingAction({ visible: false })),
	showAlert: (title: string | ReactNode, content: string | ReactNode): any => dispatch => dispatch(new ShowAlertAction({
		title, content, visible: true
	})),
	closeAlert: (): any => dispatch => dispatch(new CloseAlertAction()),
}