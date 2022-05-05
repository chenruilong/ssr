import { Context } from 'egg'

const enum RouteType {
  API = 'API',
  PAGE = 'PAGE'
}

export default <Context>{
  setPageInitData (data: any) {
    if (!data) return
    this.locals.initData = {}
    Object.keys(data).map((key: string) => this.locals.initData[key] = data[key])
  },
  getPageInitData (field: string) {
    if (!field) {
      return this.locals.initData
    }
    return this.locals.initData[field]
  },
  setPageHeadData (data: any) {
    if (!data) return
    this.locals.headData = {}
    Object.keys(data).map((key: string) => this.locals.headData[key] = data[key])
  },
  getPageHeadData (field: string) {
    if (!field) {
      return this.locals.headData
    }
    return this.locals.headData[field]
  },
  get routeType () {
    const isApiRoute = this.path.match(/^\/api\/?/)
    if (isApiRoute && isApiRoute.length > 0) {
      return RouteType.API
    } else {
      return RouteType.PAGE
    }
  },
  get isApiRoute () {
    const routeType = this.routeType
    return routeType === RouteType.API
  }
}
