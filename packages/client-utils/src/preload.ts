import { ReactESMPreloadFeRouteItem, ReactESMFeRouteItem } from 'tiger-types-react'
import { pathToRegexp } from 'path-to-regexp'
import { normalizePath } from './utils'

const preloadComponent = async (Routes: ReactESMPreloadFeRouteItem[], PrefixRouterBase?: string) => {
  for (const route of Routes) {
    const { component, path } = route
    let pathname = location.pathname
    if (PrefixRouterBase) {
      pathname = normalizePath(pathname, PrefixRouterBase)
    }
    if (component.name === 'dynamicComponent' && pathToRegexp(path, [], { end: false }).test(pathname)) {
      route.component = (await (component as ReactESMFeRouteItem['component'])()).default
    }

    if (route.routes && route.routes.length >= 0) {
      route.routes = await preloadComponent(route.routes, PrefixRouterBase)
    }
  }

  return Routes
}

export { preloadComponent }
