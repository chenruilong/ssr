export * from './ctx'
export * from './config'
export * from './yargs'

export type Mode = 'development' |'production'

export type ESMFeRouteItem<T={}> = {
  path: string
  webpackChunkName: string
} & T

export interface ParseFeRouteItem {
  path: string
  fetch?: string
  component?: string
  webpackChunkName: string
  // 扩展
  routes?: ParseFeRouteItem[] // 自路由
  preload?: boolean // 路由预加载
  exact?: boolean // 唯一路由
  meta?: any // 路由附加信息
}
