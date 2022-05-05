import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { findRouteItem, getManifest, logGreen, normalizePath, getAsyncCssChunk, getAsyncJsChunk } from 'tiger-server-utils'
import { ISSRContext, IConfig, ReactRoutesType, ReactESMFeRouteItem, IPageHead } from 'tiger-types-react'

// @ts-expect-error
import Helmet from 'react-helmet'
// @ts-expect-error
import * as serializeWrap from 'serialize-javascript'
// @ts-expect-error
import { STORE_CONTEXT as Context } from '_build/create-context'
// @ts-expect-error
import Document from '@/document.tsx'
import { Routes } from './create-router'
import {Error as ErrorPage} from 'tiger-hoc-react'

const { FeRoutes, AppFetch, App, PrefixRouterBase, state, appConfig } = Routes as ReactRoutesType
const serialize = serializeWrap.default || serializeWrap

const serverRender = async (ctx: ISSRContext, config: IConfig): Promise<React.ReactElement> => {
  const { mode, parallelFetch, disableClientRender, prefix, isVite, isDev, clientPrefix } = config
  let path = ctx.request.path // 这里取 pathname 不能够包含 queryString
  const base = prefix ?? PrefixRouterBase // 以开发者实际传入的为最高优先级
  if (base) {
    path = normalizePath(path, base)
  }

  // const routeItem = findRouteItem(FeRoutes, path)
  // const routeItem = findRoute(FeRoutes as ReactESMFeRouteItem[], path)
  const {item: routeItem, routes} = findRouteItem(FeRoutes as ReactESMFeRouteItem[], path)
  if (!routeItem) {
    throw new Error(`
    With Path: ${path} search component failed
    If you create new folder or component file, please restart server by npm start
    `)
  }

  const { webpackChunkName } = routeItem
  const dynamicCssOrder = await getAsyncCssChunk(ctx, webpackChunkName, routes)
  const dynamicJsOrder = await getAsyncJsChunk(ctx)
  const manifest = await getManifest(config)

  const injectCss: JSX.Element[] = []

  if (isVite && isDev) {
    injectCss.push(<script src="/@vite/client" type="module" key="vite-client"/>)
    injectCss.push(<script key="vite-react-refresh" type="module" dangerouslySetInnerHTML={{
      __html: ` import RefreshRuntime from "/@react-refresh"
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true`
    }} />)
  } else {
    dynamicCssOrder.forEach(css => {
      if (manifest[css]) {
        const item = manifest[css]
        injectCss.push(<link rel='stylesheet' key={item} href={item} />)
      }
    })
  }

  if (disableClientRender) {
    injectCss.push(<script key="disableClientRender" dangerouslySetInnerHTML={{
      __html: 'window.__disableClientRender__ = true'
    }}/>)
  }

  const injectScript = [
    isVite && <script key="viteWindowInit" dangerouslySetInnerHTML={{
      __html: 'window.__USE_VITE__=true'
    }} />,
    (isVite && isDev) && <script type="module" src='/node_modules/tiger-plugin-react/esm/entry/client-entry.js' key="vite-react-entry" />,
    ...dynamicJsOrder.map(js => manifest[js]).map(item => item && <script key={item} src={item} type={isVite ? 'module' : ''}/>)
  ]
  const staticList = {
    injectCss,
    injectScript
  }

  const isCsr = !!(mode === 'csr' || ctx.request.query?.csr)
  // const Component = isCsr ? React.Fragment : (await component()).default

  if (isCsr) {
    logGreen(`Current path ${path} use csr render mode`)
  }
  let appFetchData = {}
  let fetchData = {}
  let pageErrorInfo = null

  try {
    if (!isCsr) {
      // const currentFetch = fetch ? (await fetch()).default : null
  
      // csr 下不需要服务端获取数据
      if (parallelFetch) {
        [appFetchData, fetchData] = await Promise.all([
          AppFetch ? AppFetch({ ctx }) : Promise.resolve({}),
          ...routes.map((route: ReactESMFeRouteItem) => new Promise(async (resolve) => {
            const currentFetch = route.fetch ? (await route.fetch()).default : null
            if (currentFetch) {
              const data = await currentFetch({ctx})
              resolve(data)
            } else {
              resolve({})
            }
          }))
        ])
        // [layoutFetchData, fetchData] = await Promise.all([
        //   AppFetch ? AppFetch({ ctx }) : Promise.resolve({}),
        //   currentFetch ? currentFetch({ ctx }) : Promise.resolve({})
        // ])
      } else {
        appFetchData = AppFetch ? await AppFetch({ ctx }) : {}
        for (let route of routes) {
          const currentFetch = route.fetch ? (await route.fetch()).default : null
          let data = {}
          if (currentFetch) {
            data = await currentFetch({ctx})
          }
  
          fetchData = {...fetchData, ...data}
        }
        // layoutFetchData = AppFetch ? await AppFetch({ ctx }) : {}
        // fetchData = currentFetch ? await currentFetch({ ctx }) : {}
      }
    }
  } catch(e) {
    // @ts-ignore
    ctx?.logger.error(e)
    pageErrorInfo = {
      code: 500,
      message: "服务异常, 请稍候再试"
    }
  }
  const combineData = isCsr ? null : Object.assign(state ?? {}, appFetchData ?? {}, fetchData ?? {}, pageErrorInfo ? {pageErrorInfo}: {})
  // const combineData = isCsr ? null : Object.assign(state ?? {}, appFetchData ?? {}, fetchData ?? {})
  const injectState = isCsr ? null : <script dangerouslySetInnerHTML={{
    __html: `window.__USE_SSR__=true; window.__INITIAL_DATA__ =${serialize(combineData)}; ${base && `window.prefix="${base}"`};${clientPrefix && `window.clientPrefix="${clientPrefix}"`}`
  }} />

  const Page = await RenderRouter(routes, isCsr, ctx, combineData, pageErrorInfo)

  return (
    <StaticRouter location={ctx.request.url}>
      <Context.Provider value={{ state: combineData }}>
        <Document ctx={ctx} config={config} staticList={staticList} injectState={injectState}>
          <App>{Page}</App>
        </Document>
      </Context.Provider>
    </StaticRouter>
  )
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

async function RenderRouter (routes: any = [], isCsr: boolean, ctx: any, combineData: any, pageErrorInfo: any) {
  if (isCsr) {
    return React.Fragment
  }

  const route = routes.shift()
  if (!route) return null

  const Component = (await route.component()).default as any
  const isPageComponent = !route.routes || route.routes.length <= 0
  const subRoute = !isPageComponent ? await RenderRouter(routes, isCsr, ctx, combineData, pageErrorInfo): null

  if (isPageComponent) {
    const Head = head(Component?.Head)
    await renderToStaticMarkup(<Head state={combineData} />)
    const helmet = Helmet.renderStatic();
    const injectHead = [
      helmet.title.toComponent(),
      helmet.meta.toComponent(),
      helmet.link.toComponent(),
      helmet.style.toComponent(),
      helmet.script.toComponent(),
    ]
    ctx.injectHead = injectHead
  }

  return (
    isPageComponent ?
      pageErrorInfo ? <ErrorPage {...pageErrorInfo} />: <Component route={route} path={ctx.path} isReady={true} /> :
      <Component isReady={true} route={route} path={ctx.path} children={subRoute} />
  )
}
export {
  serverRender
}
