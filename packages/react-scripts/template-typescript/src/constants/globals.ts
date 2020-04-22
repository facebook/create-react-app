export const isProd = process.env.NODE_ENV === 'production'
export const isDev = process.env.NODE_ENV === 'development'

export const BASE_URL = isProd ? 'https://schedule.meshkit.cn' : isDev ? 'http://47.98.249.12/' : 'http://test.schedule.meshkit.cn/'

export const MESH_SERVER_URL = isProd ? 'https://meshkit.cn' : 'http://test.meshtech.co'

export const CLIENT_ID = isProd ? 'c02f191a63b5bac47d266275e9192cce' : isDev ? 'fe1eee5e571b6a59d24263ae0946ab0d' : 'be9ac8c5517c83c57a153eb14983da86'