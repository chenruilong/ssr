import { promises as fs } from 'fs'
import { join, resolve } from 'path'
// import { ParseFeRouteItem } from 'tiger-types'
import { getFeDir, accessFile, normalizeStartPath, writeRoutes } from './cwd'
import { loadConfig } from './loadConfig'

const getPrefix = () => {
  let { prefix } = loadConfig()
  if (prefix) {
    prefix = normalizeStartPath(prefix)
  }
  return prefix
}

export const normalizePath = (path: string, base?: string) => {
  const prefix = getPrefix()
  // 移除 prefix 保证 path 跟路由表能够正确匹配
  const baseName = base ?? prefix
  if (baseName) {
    path = path.replace(baseName, '')
  }
  if (path.startsWith('//')) {
    path = path.replace('//', '/')
  }
  if (!path.startsWith('/')) {
    path = `/${path}`
  }
  return path
}

export const normalizePublicPath = (path: string) => {
  // 兼容 /pre /pre/ 两种情况
  if (!path.endsWith('/')) {
    path = `${path}/`
  }
  return path
}

export const getOutputPublicPath = () => {
  // return /client/
  const { publicPath, isDev } = loadConfig()
  const path = normalizePublicPath(publicPath)
  return isDev ? path : `${path}client/`
}

export const getImageOutputPath = () => {
  const { publicPath, isDev } = loadConfig()
  const imagePath = 'static/images'
  const normalizePath = normalizePublicPath(publicPath)
  return {
    publicPath: isDev ? `${normalizePath}${imagePath}` : `${normalizePath}client/${imagePath}`,
    imagePath
  }
}

// const renderRoutes = async (pageDir: string, pathRecord: string[], route: ParseFeRouteItem): Promise<ParseFeRouteItem[]> => {
//   let arr: ParseFeRouteItem[] = []
//   const pagesFolders = await fs.readdir(pageDir)
//   const prefixPath = pathRecord.join('/')
//   const aliasPath = `@/pages${prefixPath}`
//   const routeArr: ParseFeRouteItem[] = []
//   const fetchExactMatch = pagesFolders.filter(p => p.includes('fetch'))
//   for (const pageFiles of pagesFolders) {
//     const abFolder = join(pageDir, pageFiles)
//     const isDirectory = (await fs.stat(abFolder)).isDirectory()
//     if (isDirectory) {
//       // 如果是文件夹则递归下去, 记录路径
//       pathRecord.push(pageFiles)

//       const childArr = await renderRoutes(abFolder, pathRecord, Object.assign({}, route))
//       pathRecord.pop() // 回溯
//       arr = arr.concat(childArr)
//     } else {
//       // 遍历一个文件夹下面的所有文件
//       if (!pageFiles.includes('render')) {
//         continue
//       }
//       // 拿到具体的文件
//       if (pageFiles.includes('render$')) {
//         /* /news/:id */
//         route.path = `${prefixPath}/:${getDynamicParam(pageFiles)}`
//         route.component = `${aliasPath}/${pageFiles}`
//         let webpackChunkName = pathRecord.join('-')
//         if (webpackChunkName.startsWith('-')) {
//           webpackChunkName = webpackChunkName.replace('-', '')
//         }
//         route.webpackChunkName = `${webpackChunkName}-${getDynamicParam(pageFiles).replace(/\/:\??/g, '-').replace('?', '-optional')}`
//       } else if (pageFiles.includes('render')) {
//         /* /news */
//         route.path = `${prefixPath}`
//         route.component = `${aliasPath}/${pageFiles}`
//         let webpackChunkName = pathRecord.join('-')
//         if (webpackChunkName.startsWith('-')) {
//           webpackChunkName = webpackChunkName.replace('-', '')
//         }
//         route.webpackChunkName = webpackChunkName
//       }

//       if (fetchExactMatch.length >= 2) {
//         // fetch文件数量 >=2 启用完全匹配策略 render$id => fetch$id, render => fetch
//         const fetchPageFiles = `${pageFiles.replace('render', 'fetch').split('.')[0]}.ts`
//         if (fetchExactMatch.includes(fetchPageFiles)) {
//           route.fetch = `${aliasPath}/${fetchPageFiles}`
//         }
//       } else if (fetchExactMatch.includes('fetch.ts')) {
//         // 单 fetch 文件的情况 所有类型的 render 都对应该 fetch
//         route.fetch = `${aliasPath}/fetch.ts`
//       }
//       routeArr.push({ ...route })
//     }
//   }
//   routeArr.forEach((r) => {
//     if (r.path?.includes('index')) {
//       // /index 映射为 /
//       if (r.path.split('/').length >= 3) {
//         r.path = r.path.replace('/index', '')
//       } else {
//         r.path = r.path.replace('index', '')
//       }
//     }

//     r.path && arr.push(r)
//   })

//   return arr
// }

// const getDynamicParam = (url: string) => {
//   return url.split('$').filter(r => r !== 'render' && r !== '').map(r => r.replace(/\.[\s\S]+/, '').replace('#', '?')).join('/:')
// }

const parseManualRoutes = async () => {
  const { transform } = await import('esbuild')
  const { dynamic, isVite, nprogress } = loadConfig()
  if (isVite && !dynamic) {
    throw new Error('Vite模式禁止关闭 dynamic ')
  }

  const declaretiveRoutes = await accessFile(resolve(getFeDir(), './route.ts')) // 是否存在自定义路由
  const re = /webpackChunkName: ('(.+?)')/g

  let manualRoutes = ''
  if (declaretiveRoutes) {
    manualRoutes = (await fs.readFile(resolve(getFeDir(), './route.ts'))).toString()
  } else {
    manualRoutes = 'export {}'
  }

  manualRoutes = manualRoutes.replace(/component:\s*(['|"](.+?)['|"])/g, (global, m1, m2) => {
    const paths = m2.replace(/^@\/(pages|components)/, (match: string, $1: string) => $1 === 'pages' ? 'p' : 'c').split('/').filter((key: string) => key)
    const currentWebpackChunkName = paths.join('-')
    const component = m2.replace(/\/$/, '')

    if (dynamic) {
      return `webpackChunkName: '${currentWebpackChunkName}',
        component: function dynamicComponent () {
          return import(/* webpackChunkName: "${currentWebpackChunkName}" */ '${component}/render.tsx')
        },
        exact: ${!/^@\/components/.test(m2)}`
    } else {
      return `component: require('${component}/render.tsx').default,
        exact: ${!/^@\/components/.test(m2)}`
    }
  })

  manualRoutes = manualRoutes.replace(/fetch:\s*(true|false)(,*)/g, (global, m1, m2) => {
    const currentWebpackChunkName = re.exec(manualRoutes)![2]
    const component = currentWebpackChunkName.replace(/^(p|c)-/, (match: string, $1: string) => $1 === 'p' ? 'pages-' : 'components-').replace(/-/g, '/')
    const webpackChunkName = currentWebpackChunkName.replace(/^(p|c)-/, 'f-')

    if (m1 === 'true') {
      return `fetch: function fetch () {
        return import(/* webpackChunkName: "${webpackChunkName}" */ '@/${component}/fetch.ts')
      }${m2}`
    }

    return ''
  })

  const accessDocument = await accessFile(resolve(getFeDir(), './document.tsx')) // html root
  const accessApp = await accessFile(resolve(getFeDir(), './app.tsx')) // app
  const accessErrorPage = await accessFile(join(getFeDir(), './error.tsx')) // global error page
  const accessAppFetch = await accessFile(resolve(getFeDir(), './fetch.ts')) // app fetch
  const accessStore = await accessFile(join(getFeDir(), './store/index.ts'))
  const accessAppConfig = await accessFile(join(getFeDir(), './config/app.ts'))

  manualRoutes = `
    ${manualRoutes}
    ${accessDocument ? 'export {default as Document} from \'@/document.tsx\'' : ''}
    ${accessApp ? 'export {default as App} from \'@/app.tsx\'' : ''}
    ${accessErrorPage ? 'export {default as ErrorPage} from \'@/error.tsx\'' : ''}
    ${accessAppFetch ? 'export {default as AppFetch} from \'@/fetch.ts\'' : ''}
    ${accessStore ? 'export * from \'@/store/index.ts\'' : ''}
    ${accessAppConfig ? 'export {default as appConfig} from \'@/config/app.ts\'' : ''}
    ${nprogress ? 'export {default as NProgress} from \'nprogress\'' : ''}
    ${nprogress instanceof Object ? `export const NProgressConfig = ${JSON.stringify(nprogress)}` : ''}
  `
  // without manualRoutes create emtry object
  const { code } = await transform(manualRoutes, {
    loader: 'ts',
    format: 'esm',
    keepNames: true
  })

  // remove empty character and wrapline in vite mode for rollup
  const serializeCode = code.replace(/(import\([\s\S]*?,)/g, (match) => {
    return match.replace(/\s/g, '')
  })

  await writeRoutes(serializeCode, 'ssr-manual-routes.js')
  await writeRoutes('export {}', 'ssr-declare-routes.js')
}

export {
  parseManualRoutes as parseFeRoutes
}
