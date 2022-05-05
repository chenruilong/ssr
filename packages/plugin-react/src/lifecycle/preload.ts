import { Routes } from '../entry/create-router'
import { getCache } from '../entry/cache'
import { ReactRoutesType, ILifecycleCtx, ILifecycleKernal } from 'tiger-types-react'
const { AppFetch } = Routes as ReactRoutesType
const isDev = process.env.NODE_ENV !== 'production'

export default function preload (this: ILifecycleKernal) {
  return async (ctx: ILifecycleCtx, next: Function) => {
    let pageErrorInfo = null

    const cache = getCache(ctx.location.pathname + (ctx.location?.key ?? ''))
    // 路由缓存优先 存在路由缓存先加载路由缓存
    if (cache) {
      if (isDev) console.log(`get cache route[${ctx.location.pathname}] data ->`, cache)

      const { scrollInfo = {}, ...pageData } = cache
      const combineData = Object.assign({}, pageData)

      this.routePreload = true
      this.routeInitScrollInfo = scrollInfo
      this.preloadInitData = {
        asyncData: combineData
      }
    } else if (ctx.route.preload) {
      // 路由开启了数据预加载
      const routerProps = this.getFetchProps(ctx.location.pathname, ctx.route)
      let asyncLayoutData = {}
      let asyncData = {}

      try {
        if (AppFetch) {
          asyncLayoutData = await AppFetch({ routerProps })
        }

        for (const route of ctx.subRoute) {
          if (route.fetch) {
            const fetchFn = await route.fetch()
            const data = await fetchFn.default({ routerProps })
            asyncData = { ...asyncData, ...data }
          }
        }
      } catch (e) {
        console.error(e)
        pageErrorInfo = {
          code: 500,
          message: '服务异常, 请稍候再试'
        }
      }
      this.preloadInitData = {
        asyncLayoutData,
        asyncData,
        pageErrorInfo
      }
      this.routePreload = true
    } else {
      this.routePreload = false
    }

    await next()
  }
}
