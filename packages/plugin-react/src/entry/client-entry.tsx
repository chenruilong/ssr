import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch, Prompt, matchPath } from 'react-router-dom'
// @ts-expect-error
import { createBrowserHistory } from "history"
import { preloadComponent, findRouteItem } from 'tiger-client-utils'
import { wrapComponent } from 'tiger-hoc-react'
import { DocumentProps, ReactRoutesType, ReactESMFeRouteItem, ReactESMPreloadFeRouteItem } from 'tiger-types-react'
import { Routes } from './create-router'
import { AppContext } from './context'
import { setCache } from './cache'
import LifeCycleMiddleware from '../lifecycle'
import initMiddleware from "../lifecycle/init"
import loadingMiddleware from "../lifecycle/loading"
import preloadMiddleware from "../lifecycle/preload"
import renderRouteMiddleware from '../lifecycle/renderRoute'
import loadComponentMiddleware from '../lifecycle/loadComponents'

const { FeRoutes, AppFetch, App, PrefixRouterBase, NProgress, NProgressConfig } = Routes as ReactRoutesType

declare const window: any

interface IEntryProps {
  routes: ReactESMFeRouteItem[]
  baseName: string
}
const IApp = App ?? function (props: DocumentProps) {
  return props.children!
}
const clientRender = async (): Promise<void> => {
  // 客户端渲染||hydrate
  const baseName = (window.microApp && window.clientPrefix) ?? window.prefix ?? PrefixRouterBase
  const routes = await preloadComponent(FeRoutes as ReactESMPreloadFeRouteItem[], baseName)
  ReactDOM[window.__USE_SSR__ ? 'hydrate' : 'render'](
    <Entry routes={routes as ReactESMFeRouteItem[]} baseName={baseName} />
    , document.getElementById('app'))
}
if (!window.__disableClientRender__) {
  // 如果服务端直出的时候带上该记号，则默认不进行客户端渲染，将处理逻辑交给上层
  // 可用于微前端场景下自定义什么时候进行组件渲染的逻辑调用
  clientRender()
}



class Entry extends React.Component<IEntryProps, any> {
  progress: any

  preloadData: any
  routePreload?: boolean

  route: any
  location: any
  prevRoute: any
  prevLocation: any

  hasRender: undefined | boolean = window.__USE_SSR__
  
  routeFetchData: any // 当前路由fetch数据
  routeCacheKeys: any // 当前路由需要缓存的fetch key
  routeInitScrollInfo: any // 路由滚动条初始位置

  isAppFetch: boolean = false

  constructor(props: IEntryProps) {
    super(props)

    // 初始化SSR
    const {item: routeItem} = findRouteItem(FeRoutes as ReactESMFeRouteItem[], window.location.pathname)
    this.route = this.prevRoute = routeItem
    this.location = this.prevLocation = {
      pathname: window.location.pathname,
      hash: window.location.hash,
      search: window.location.search,
      key: window.history.state?.key
    }

    // 设置加载进度条
    if (NProgress) {
      require('nprogress/nprogress.css')
      this.progress = NProgress
      this.progress.configure(NProgressConfig)
    }

    setCache(this.location.pathname + (this.location?.key ?? ""), {})

    // 初始路由数据
    if (window.__INITIAL_DATA__) {
      this.routeCacheKeys = Object.keys(window.__INITIAL_DATA__)
      this.routeFetchData = window.__INITIAL_DATA__
      delete window.__INITIAL_DATA__
    }
  }

  shouldComponentUpdate() {
    return false
  }

  private message(location: any, action: any) {
    return JSON.stringify({
      location,
      action
    })
  }
    /**
   * 处理路由跳转
   */
  public getUserConfirmation(message: string, callback: any) {
    // 初始化生命周期
    const app = new LifeCycleMiddleware()

    // init
    app.use(initMiddleware.call(this as any, message, callback))
    //
    // // 全局loading加载
    app.use(loadingMiddleware.call(this))
    //
    // // 加载路由组件
    app.use(loadComponentMiddleware.call(this as any))
    //
    // // 预加载数据
    app.use(preloadMiddleware.call(this as any))

    // 渲染页面
    app.use(renderRouteMiddleware.call(this))

    app.listen()
  }

  getFetchProps(pathname: string, route: string) {
    const history = createBrowserHistory({
      basename: this.props.baseName,
      getUserConfirmation: this.getUserConfirmation.bind(this)
    })
    return {
      location: {},
      history,
      match: matchPath(pathname, route)
    }
  }

  private RenderRoute(routes: ReactESMFeRouteItem[]) {
    return (
    <Switch>
      {routes.map(route => {
        route.component.fetch = route.fetch
        route.component.appFetch = AppFetch
        const WrappedComponent = wrapComponent.call(this as any, route.component)
        const subRoutes = route.routes ? this.RenderRoute(route.routes): null
        
        return (
          <Route exact={route?.exact ?? false} key={route.path} path={route.path} render={() => {
            return (
              <>
                {
                  route.routes && route.routes.length > 0 ? (
                    <WrappedComponent key={route.path} children={subRoutes} route={route} isPageComponent={false} />
                  ): (
                    <WrappedComponent key={window.location.pathname} route={route} isPageComponent={true} />
                  )
                }
              </>
            )
          }}/>
        )
      })}
    </Switch>
  )
  }
  render() {
    return (
      <BrowserRouter basename={this.props.baseName} getUserConfirmation={this.getUserConfirmation.bind(this)}>
        <Prompt message={this.message} />
        <AppContext>
          <IApp>
            {this.RenderRoute(this.props.routes)}
          </IApp>
        </AppContext>
      </BrowserRouter>
    )
  }
}

export {
  clientRender
}
