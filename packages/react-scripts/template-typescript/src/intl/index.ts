import zh_CN from "./zh_CN";
import en_US from "./en_US ";
import { ILocalization } from './interface'

export type ILocales = 'en-US' | 'zh-CN'

export function getLocales(lang: ILocales): ILocalization
{
	switch (lang)
	{
		case ('en-US'):
			return en_US
		case ('zh-CN'):
			return zh_CN
		default:
			return en_US
	}
}

export default {
	"en-US": en_US,
	"zh-CN": zh_CN
}