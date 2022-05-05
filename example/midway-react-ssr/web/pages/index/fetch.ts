import { ReactMidwayKoaFetch } from 'tiger-types-react'
import { SSRRequestData } from '~/typings/data'

import {render} from '@/utils'
import services from '@/services'

const fetch: ReactMidwayKoaFetch = async ({ ctx, routerProps }) => {
  // 阅读文档获得更多信息 http://doc.ssr-fc.com/docs/features$fetch#%E5%88%A4%E6%96%AD%E5%BD%93%E5%89%8D%E7%8E%AF%E5%A2%83
  const fetchData: SSRRequestData = __isBrowser__ ? await services.csr.getIndexData() : await ctx!.getPageInitData()
  const data = await render.getPageInitData(fetchData)

  return {
    // 建议根据模块给数据加上 namespace防止数据覆盖
    indexData: data
  }
}

export default fetch
