import { Controller, Get, Provide, Inject, Param } from '@midwayjs/decorator'
import { Context } from '@midwayjs/web'

import { SSRRequestData } from '~/typings/data'

import { ApiService } from '@/service/api'
import { PageService } from '@/service/page'

@Provide()
@Controller('/csr')
export class Index {
  @Inject()
  ctx: Context

  @Inject()
  apiService: ApiService

  @Inject()
  pageService: PageService

  @Get('/index')
  async indexPage (): Promise<void> {
    const [err, indexData] = await this.ctx.helper.catchAwait(this.pageService.indexData())

    this.ctx.body = { error: err, data: indexData } as SSRRequestData
  }

  @Get('/detail/:id')
  async detailPage (@Param('id') id: string): Promise<void> {
    const [err, detailData] = await this.ctx.helper.catchAwait(this.pageService.detailData(id))

    this.ctx.body = { error: err, data: detailData } as SSRRequestData
  }
}
