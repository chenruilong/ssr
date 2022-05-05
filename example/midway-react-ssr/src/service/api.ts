import { Provide, Inject, Config, ALL } from '@midwayjs/decorator'
import { Context } from '@midwayjs/web'

import { ISAIndex } from '~/typings/data'

@Provide()
export class ApiService {
  @Inject()
  ctx: Context

  @Config(ALL)
  config: any

  async index (): Promise<ISAIndex> {
    return await Promise.resolve({
      text: 'hello index api'
    })
  }
}
