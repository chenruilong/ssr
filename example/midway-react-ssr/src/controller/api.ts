import { Inject, Controller, Provide, Get } from '@midwayjs/decorator'
import { Context } from '@midwayjs/web'

import { ApiService } from '@/service/api'

@Provide()
@Controller('/api')
export class Api {
  @Inject()
  ctx: Context

  @Inject('ApiService')
  apiService: ApiService

  @Get('/index')
  async getIndexData () {
    const data = await this.apiService.index()
    return data
  }
}
