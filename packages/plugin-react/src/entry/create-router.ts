// @ts-expect-error
import * as declareRoutes from '_build/ssr-declare-routes'
// @ts-expect-error
import * as ManualRoutes from '_build/ssr-manual-routes'
import { ReactRoutesType } from 'tiger-types-react'

const declareRoutesWithType = declareRoutes as ReactRoutesType
const ManualRoutesWithType = ManualRoutes as ReactRoutesType

const Routes: ReactRoutesType = {
  ...declareRoutes,
  ...ManualRoutesWithType
}
if (ManualRoutesWithType.FeRoutes) {
  // 声明式路由覆盖约定式路由同名path
  const combineRoutes = declareRoutesWithType.FeRoutes?.map(route => ManualRoutesWithType.FeRoutes.find(e => e.path === route.path) ?? route) ?? []
  ManualRoutesWithType.FeRoutes.forEach(route => {
    // 补充声明式路由新增的配置
    const found = combineRoutes.find(e => e.path === route.path)
    if (!found) {
      combineRoutes.push(route)
    }
  })
  Routes.FeRoutes = combineRoutes
}
export {
  Routes
}
