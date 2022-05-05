import { Provide } from '@midwayjs/decorator'

@Provide()
export class PageService {
  async indexData (): Promise<any> {
    return await Promise.resolve({
      text: '首页'
    })
  }

  async detailData (id: string) {
    return {
      text: `detail id: ${id}`
    }
  }
}
