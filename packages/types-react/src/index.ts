import { ReactESMFeRouteItem } from './route'

export * from 'tiger-types'
export * from './route'
export * from './component'

export interface ILifecycleCtx {
  progress: any
  route: any
  subRoute: any
  lastRoute: any
  location: any
  routeAction: string
  lastLocation: any
  routes: ReactESMFeRouteItem[]
  callback: Function
}
export interface ILifecycleKernal {
  baseName: string
  hasRender: boolean

  progress: any

  route: any
  location: any
  prevRoute: any
  prevLocation: any

  routeFetchData: any // 当前路由fetch数据
  routeInitScrollInfo: any // 路由滚动条初始位置
  routeCacheKeys: any // 当前路由需要缓存的fetch key
  preloadInitData: any
  routePreload: boolean

  isAppFetch: boolean
  getFetchProps: (pathname: any, route: any) => any
}

export interface IPageHead {
  title?: string
  description?: string
  keywords?: string
  raw?: any
}
