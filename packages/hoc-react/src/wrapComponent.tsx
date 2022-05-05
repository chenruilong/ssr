import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
// @ts-expect-error
import Helmet from 'react-helmet'

import { Action, ReactESMFetch, ReactFetch, ILifecycleKernal } from 'tiger-types-react'
// @ts-expect-error
import { STORE_CONTEXT } from '_build/create-context'
// @ts-expect-error
import {appConfig} from '_build/ssr-manual-routes'

import {Error as ErrorPage} from './error'
import { IPageHead } from 'tiger-types-react/src'

declare const window: any

interface fetchType {
  fetch?: ReactESMFetch
  appFetch?: ReactFetch
}

async function fetchAndDispatch (this: ILifecycleKernal, { fetch, appFetch }: fetchType, dispatch: React.Dispatch<Action>, routerProps: RouteComponentProps, state: any) {
  let pageErrorInfo = null
  let combineData = {}

  // 组件数据没有预加载
  if (!this.routePreload) {
    let asyncAppData = {}
    let asyncData = {}
    try {
      if (appFetch) {
        asyncAppData = await appFetch({ routerProps, state })
      }
      if (fetch) {
        const fetchFn = await fetch()
        asyncData = await fetchFn.default({ routerProps, state })
      }
    } catch (e) {
      pageErrorInfo = {
        code: 500,
        message: "服务异常, 请稍候重试"
      }
      console.log(e)
    }

    // 通过初始化fetch获取缓存key
    this.routeCacheKeys = asyncData ? Object.keys(asyncData): []
    this.routeFetchData = asyncData
    combineData = Object.assign({}, asyncAppData, asyncData, {pageErrorInfo})
  } else {
    const {asyncAppData, asyncData, pageErrorInfo} = this.preloadInitData
    // 通过初始化fetch获取缓存key
    this.routeCacheKeys = asyncData ? Object.keys(asyncData): []
    this.routeFetchData = asyncData

    combineData = Object.assign({}, asyncAppData, asyncData, {pageErrorInfo})
  }
  
  await dispatch({
    type: 'updateContext',
    payload: combineData
  })
}

function wrapComponent (this: ILifecycleKernal, WrappedComponent: any) {
  return withRouter((props: any) => {
    const Loading = loading(props.route.component?.Loading)
    const Head: any = head(props.route.component?.Head)

    const [ready, setReady] = useState(this.hasRender)
    const { state, dispatch } = useContext(STORE_CONTEXT)

    if (WrappedComponent.name === 'dynamicComponent') {
      const { fetch, appFetch } = (WrappedComponent as any)
      WrappedComponent = props.route.component
      WrappedComponent.fetch = fetch
      WrappedComponent.appFetch = appFetch
    }
    useEffect(() => {
      didMount.call(this)
      return () => {
          setReady(false)
      }
    }, [])

    const cacheRouteData = (state: any) => {
      if (!this.routeCacheKeys || this.routeCacheKeys.length <= 0) return

      const keys = this.routeCacheKeys
      this.routeFetchData = keys.length > 0 ? keys.reduce((res: any, item: any) => {
        res[item] = state[item]
        return res
      }, {}): {}
    }

    const didMount = async () => {
      const { fetch, appFetch } = (WrappedComponent as any)
      // ssr 情况下只有路由切换的时候才需要调用 fetch
      // csr 情况首次访问页面也需要调用 fetch
      if (!ready || !window.__USE_SSR__) {
        await fetchAndDispatch.call(this, { fetch, appFetch }, dispatch, props, state)
        if (props.isPageComponent) {
          this.progress && this.progress.done()
        }
      }

      setReady(true)
      this.hasRender = false

      // 恢复滚动条位置
      if (this.routeInitScrollInfo) {
        const {x, y} = this.routeInitScrollInfo

        setTimeout(() => {
          window?.scrollTo(x, y);
        }, 0);
      }
    }

    return (
      <>
        <STORE_CONTEXT.Consumer>
          {({state}: any) => cacheRouteData(state)}
         </STORE_CONTEXT.Consumer>
        {
          props.isPageComponent ?
          <GlobalErrorPage>{ready ? (
            <>
              <Head state={state} />
              <WrappedComponent progress={this.progress} {...props} />
            </>
          ) : <Loading/>}</GlobalErrorPage> :
            <WrappedComponent progress={this.progress} {...props} isReady={ready} />
        }
      </>
    )
  })
}

function head (data: any) {
  return (props: any) => {
    if (!data) {
      const {title, description, keywords} = appConfig?.siteInfo ?? {}
      return (
        <Helmet>
          {title && <title>{title}</title>}
          {keywords && <meta name="keywords" content={keywords} />}
          {description && <meta name="description" content={description} />}
        </Helmet>
      )
    }

    const {title, description, keywords, raw}: IPageHead = data(props.state)

    return (
      <Helmet>
        {title && <title>{title}</title>}
        {keywords && <meta name="keywords" content={keywords} />}
        {description && <meta name="description" content={description} />}
        {raw && raw()}
      </Helmet>
    )
  }
}

function loading (Component: any) {
  return () => {
    const [loading, setLoading] = useState(false)
    let loadingTimer: any = null

    useEffect(() => {
      didMount()
      return () => {
        clearTimeout(loadingTimer)
        loadingTimer = null
      }
    }, [])

    const didMount = async () => {
      if (Component) {
        loadingTimer = setTimeout(() => {
          clearTimeout(loadingTimer)
          loadingTimer = null

          setLoading(true)
        }, 100)
      }
    }

    return loading ? <Component />: null
  }
}

function GlobalErrorPage (props: any) {
  const { state } = useContext(STORE_CONTEXT)
  return (
    state.pageErrorInfo ? <ErrorPage {...state.pageErrorInfo} />: props.children!
  )
}

export {
  wrapComponent
}
