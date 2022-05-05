// @ts-ignore
import { Routes } from '../entry/create-router'
import { setCache, cache } from '../entry/cache'
import { ReactRoutesType, ILifecycleCtx, ILifecycleKernal } from 'tiger-types-react'
import {findRouteItem} from 'tiger-client-utils'

const { FeRoutes } = Routes as ReactRoutesType
const isDev = process.env.NODE_ENV !== 'production'

declare const document: any
declare const window: any

export default function (this: ILifecycleKernal, message: string, callback: Function) {
    return async (ctx: ILifecycleCtx, next: Function) => {
        // 是否允许跳转
        ctx.callback = (isPass: boolean) => {
            this.prevRoute = ctx.route
            this.prevLocation = ctx.location
            callback(isPass)
        }

        // 加载loading
        ctx.progress = null
        if (this.progress) {
            ctx.progress = this.progress
        }

        // 加载routes
        ctx.routes = FeRoutes

        // 记录当前访问route信息
        const routeMessage = JSON.parse(message)
        ctx.location = routeMessage.location
        ctx.routeAction = routeMessage.action

        const {item: routeItem, routes} = findRouteItem(ctx.routes, ctx.location.pathname)
        ctx.route = routeItem
        ctx.subRoute = routes


        // path一致不重复处理
        if (ctx.location?.pathname === this.prevLocation?.pathname) {
            ctx.callback(false)
            return false
        }

        // 挂载组件
        this.location = ctx.location
        this.route = ctx.route

        // 跳转前缓存上一个路由数据
        if (isDev) {
            if (this.routeCacheKeys) {
                console.log(`cache route[${this.prevLocation?.pathname}] keys ->`, this.routeCacheKeys)
            } else {
                console.log(`cache route[${this.prevLocation?.pathname}] keys -> none`)
            }
        }
        if (this.routeCacheKeys && this.routeCacheKeys.length > 0) {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset
            const cacheData = {
                ...this.routeFetchData,
                scrollInfo: {
                    x: 0,
                    y: scrollTop
                }
            }
            if (isDev) {
                console.log(`cache route[${this.prevLocation?.pathname}] key ->`, this.prevLocation.key)
                console.log(`cache route[${this.prevLocation?.pathname}] data ->`, cacheData)
            }
            setCache(this.prevLocation.pathname + (this.prevLocation?.key ?? ""), cacheData)

            // 最多缓存10个路由
            if (cache.size > 10) {
                const keys = Array.from(cache.keys())
                cache.delete(keys[0])
            }
        }

        // ::TODO 删除PUSH之前的路由与PUSH之后的路由中间所有路由
        if (ctx.routeAction === "PUSH") {
            if (this.prevLocation) {
                const keys = Array.from(cache.keys())
                const lastIndex = this.prevLocation ? keys.findIndex(key => key === this.prevLocation.pathname + (this.prevLocation?.key ?? "")): 0
                const deleteKeys = keys.slice(lastIndex + 1)
                deleteKeys.map(key => {
                    cache.delete(key)
                    if (isDev) {
                        console.log('push route clear ->', key)
                    }
                })
            }
        }

        // 初始化数据/缓存
        this.routeCacheKeys = []
        this.routeFetchData = {}
        this.routeInitScrollInfo = null

        await next()
    }
}
