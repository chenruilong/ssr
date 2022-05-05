import { Readable } from 'stream'
import { Controller, Get, Provide, Inject, Param } from '@midwayjs/decorator'
import { Context } from '@midwayjs/web'
import { render } from 'tiger-core-react'

import { ApiService } from '@/service/api'
import { PageService } from '@/service/page'

@Provide()
@Controller('/')
export class Index {
  @Inject()
  ctx: Context

  @Inject()
  apiService: ApiService

  @Inject()
  pageService: PageService

  @Get('/')
  async indexPage (): Promise<void> {
    const [err, indexData] = await this.ctx.helper.catchAwait(this.pageService.indexData())

    err
      ? this.ctx.setPageInitData({ error: err })
      : this.ctx.setPageInitData({ data: indexData })

    const stream = await render<Readable>(this.ctx, { stream: true })
    this.ctx.body = stream
  }

  @Get('/detail/:id')
  async detailPage (@Param('id') id: string): Promise<void> {
    const [err, detailData] = await this.ctx.helper.catchAwait(this.pageService.detailData(id))

    err
      ? this.ctx.setPageInitData({ error: err })
      : this.ctx.setPageInitData({ data: detailData })

    const stream = await render<Readable>(this.ctx, { stream: true })
    this.ctx.body = stream
  }
}
