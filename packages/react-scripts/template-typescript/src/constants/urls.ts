declare const LOCAL_SERVER: any;
export const ROOT = LOCAL_SERVER ? "" : "";

export const URLS = {
	HOME: ROOT + "/",
	ERROR: ROOT + '/error',
	NOT_FOUND: ROOT + '/error/404',
	UNAUTHORIZED: ROOT + '/error/401',
}