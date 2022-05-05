import { ILifecycleCtx, ILifecycleKernal } from 'tiger-types-react'
export default function loadComponent (this: ILifecycleKernal) {
  return async (ctx: ILifecycleCtx, next: Function) => {
    await Promise.all(ctx.subRoute.reduce((res: any, route: any) => {
      const { component } = route
      if (component.name === 'dynamicComponent') {
        const { fetch, appFetch } = component

        res.push(new Promise<void>(resolve => {
          component().then((com: any) => {
            console.log({ com })
            route.component = com.default
            route.component.fetch = fetch
            route.component.appFetch = appFetch
            resolve()
          })
          // route.component = (await component()).default
        }))
      }
      return res
    }, []))

    await next()
  }
}
