import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { routerActions } from 'react-router-redux'
import { BASE_URL } from '../constants/globals'
import { URLS } from '../constants/urls'
import { actionCreators as applicationActionCreators } from '../store/application/actions'
import Message from '../components/Elements/Message'

/**
 * axios single instance manager
 */
export default class HttpManager
{
	// HttpManager instance
	private static _httpManager: HttpManager

	// axios instance
	private instance: AxiosInstance

	private accessToken: string

	private store: any

	constructor()
	{
		this.instance = axios.create({
			baseURL: BASE_URL,
			timeout: 10000,
			// withCredentials: true, // allowed to carry cookies
		})
		this.initInterceptors()
	}

	public static getInstance()
	{
		if (!this._httpManager)
		{
			this._httpManager = new HttpManager()
		}

		return this._httpManager
	}

	public init(store)
	{
		this.store = store
	}

	private initInterceptors()
	{
		if (this.instance)
		{
			// Add a request interceptor
			this.instance.interceptors.request.use(
				(config: AxiosRequestConfig) =>
				{
					// Do something before request is sent
					return config
				},
				(error: any) =>
				{
					return Promise.reject(error)
				}
			)

			// Add a response interceptor
			this.instance.interceptors.response.use(
				(response: AxiosResponse) =>
				{
					console.log('AxiosResponse', response)
					let url = response.config.url
					const baseURL = response.config.baseURL
					const responseURL = response.request.responseURL
					if (url && baseURL && !url.startsWith(baseURL))
					{
						url = `${baseURL}/${url}`
					}
					if (url && responseURL && decodeURI(url) !== decodeURI(responseURL)) // http status is 302
					{
						this.handleBrowserRedirect(responseURL)
					}

					return response.data
				},
				(error: any) =>
				{
					if (error.response)
					{
						switch (error.response.status)
						{
							case 400:
								this.handleBadRequestError()
								break
							case 401:
								this.handleUnauthorizedError()
								break
							case 404:
								this.handleNotFoundError()
								break
							case 500:
								this.handleServerError()
								break
							case 502:
								this.handleBadGatewayError()
								break
							default:
						}
					}
					else
					{
						if (error.message === 'Network Error')
						{
							console.warn('Network Error')
							this.handleNetworkError()
						}
					}
					return Promise.reject(error)
				}
			)
		}
	}

	private handleBrowserRedirect(location: string)
	{
		window.location.href = decodeURI(location)
	}

	private handleBadRequestError()
	{
		this.store.dispatch(applicationActionCreators.showAlert(Message('requestErrorTitle'), Message('badRequestErrorText')))
	}

	private handleUnauthorizedError()
	{
		this.store.dispatch(routerActions.replace(URLS.UNAUTHORIZED))
	}

	private handleNotFoundError()
	{
		this.store.dispatch(applicationActionCreators.showAlert(Message('requestErrorTitle'), Message('notFoundErrorText')))
	}

	private handleServerError()
	{
		this.store.dispatch(applicationActionCreators.showAlert(Message('requestErrorTitle'), Message('serverErrorText')))
	}

	private handleBadGatewayError()
	{
		this.store.dispatch(applicationActionCreators.showAlert(Message('requestErrorTitle'), Message('badGatewayErrorText')))
	}

	private handleNetworkError()
	{
		this.store.dispatch(applicationActionCreators.showAlert(Message('networkErrorTitle'), Message('networkErrorText')))
	}

	public setAccessToken(accesstoken: string)
	{
		this.accessToken = accesstoken
	}

	public setRequestTimeout(time: number)
	{
		this.instance.defaults.timeout = time
	}

	public setBaseUrl(url: string)
	{
		this.instance.defaults.baseURL = url
	}

	public get<T>(url: string, config?: AxiosRequestConfig): Promise<T>
	{
		return this.instance.get(url, config || { headers: { 'x-mesh-access-token': this.accessToken || '' } })
	}

	public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
	{
		return this.instance.post(url, data, config || { headers: { 'x-mesh-access-token': this.accessToken || '' } })
	}

	public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
	{
		return this.instance.put(url, data, config || { headers: { 'x-mesh-access-token': this.accessToken || '' } })
	}

	public delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>
	{
		return this.instance.delete(url, config || { headers: { 'x-mesh-access-token': this.accessToken || '' } })
	}
}