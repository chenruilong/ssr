import { Context } from 'egg'
import * as errors from '@site-packages/common/error'
import { SSRRequestData, LayoutInitData } from '~/typings/data'

export default {
  async getPageInitData (requestData: SSRRequestData) {
    if (requestData?.error) {
      this.getPageInitLayoutByError(requestData?.error)
    }

    return requestData.data || {}
  },
  getPageInitLayoutByError (errorInfo: any) {
    const error: any = (<any>errors)[errorInfo.name] ? new (<any>errors)[errorInfo.name](errorInfo) : new Error(errorInfo.message)

    if (error instanceof errors.RequestError) {
      switch (error.code) {
        case 404:
          throw new Error('404')
        case 500:
        default:
          throw new Error('500')
      }
    }
  },
  async getLayoutInitData (ctx: Context): Promise<LayoutInitData> {
    const layoutData: LayoutInitData = {}
    if (__isBrowser__) return layoutData

    layoutData.userInfo = ctx.locals.userInfo || {}

    return layoutData
  }
}
