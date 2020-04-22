import { Action } from "redux";

interface ActionClass<T>
{
	prototype: T
}

export class StrongAction implements Action
{
	type: string;
}

export function TypeName(name)
{
	return function (actionClass)
	{
		actionClass.prototype.type = name;
	};
}

export function isActionType<T extends Action>(action: Action, actionClass: ActionClass<T>): action is T
{
	return action.type === actionClass.prototype.type;
}

export const typedToPlain = function (store)
{
	return function (next)
	{
		return function (action)
		{
			next({ type: action.__proto__.type, ...action })
		};
	};
};