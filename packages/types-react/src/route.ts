import { RouteComponentProps } from 'react-router-dom'
import { ISSRContext, ISSRNestContext, ISSRMidwayContext, IConfig, ISSRMidwayKoaContext } from 'tiger-types'
import { Action } from './component'

export interface DocumentProps {
  ctx?: ISSRContext
  config?: IConfig
  children?: JSX.Element
  staticList?: StaticList
  injectState?: any
}
export interface ErrorPageProps {
  code?: number
  message?: string
}
export interface StaticList {
  injectCss: JSX.Element[]
  injectScript: JSX.Element[]
}

export interface ProvisionalFeRouteItem {
  path?: string
  layout: string
  fetch?: string
  component?: string
}

export interface Params<T, U> {
  ctx?: ISSRContext<T>
  routerProps?: RouteComponentProps<U>
  state?: any
}
export interface ParamsMidway<T, U> {
  ctx?: ISSRMidwayContext<T>
  routerProps?: RouteComponentProps<U>
  state?: any
}
export interface ParamsMidwayKoa<T, U> {
  ctx?: ISSRMidwayKoaContext<T>
  routerProps?: RouteComponentProps<U>
  state?: any
}
export interface ParamsNest<T, U> {
  ctx?: ISSRNestContext<T>
  routerProps?: RouteComponentProps<U>
  state?: any
}

export type ReactFetch<T={}, U={}> = (params: Params<T, U>) => Promise<any>
export type ReactMidwayFetch<T={}, U={}> = (params: ParamsMidway<T, U>) => Promise<any>
export type ReactMidwayKoaFetch<T={}, U={}> = (params: ParamsMidwayKoa<T, U>) => Promise<any>
export type ReactNestFetch<T={}, U={}> = (params: ParamsNest<T, U>) => Promise<any>

export type ReactESMFetch = () => Promise<{
  default: ReactFetch
}>

export type ESMLayout = () => Promise<React.FC<DocumentProps>>

export interface StaticFC<T={}> extends React.FC<T> {
  fetch?: ReactESMFetch
  appFetch?: ReactFetch
  route?: ReactESMFeRouteItem
}

export interface DynamicFC<T = {}> extends React.FC<T>{
  (): Promise<{
    default: StaticFC<T>
  }>
  name: 'dynamicComponent'
  fetch?: ReactESMFetch
  appFetch?: ReactFetch
  route?: ReactESMFeRouteItem
}

export type ReactESMFeRouteItem<T = {}, U={}> = {
  path: string
  fetch?: ReactESMFetch
  component: DynamicFC<T>
  webpackChunkName: string
  // 扩展
  routes?: ReactESMFeRouteItem[] // 自路由
  preload?: boolean // 路由预加载
  exact?: boolean // 唯一路由
  meta?: any // 路由附加信息
} & U

export type ReactESMPreloadFeRouteItem<T = {}, U={}> = {
  path: string
  fetch?: ReactESMFetch
  component: DynamicFC<T> | StaticFC<T>
  webpackChunkName: string
  routes: ReactESMPreloadFeRouteItem[]
} & U

export interface ReactRoutesType {
  Document: React.FC<DocumentProps>
  App?: any
  AppFetch: ReactFetch
  FeRoutes: ReactESMFeRouteItem[]
  PrefixRouterBase?: string
  state?: any
  reducer?: any
  ErrorPage?: React.FC<ErrorPageProps>
  appConfig?: AppConfig
  NProgress?: any
  NProgressConfig?: any
}
export interface AppConfig {
  siteInfo: {
    title: string
    description: string
    keywords: string
  }
}
export interface IContext<T=any> {
  state?: T
  dispatch?: React.Dispatch<Action>
}
