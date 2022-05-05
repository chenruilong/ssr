import { Configuration, App } from '@midwayjs/decorator'
import * as web from '@midwayjs/web'
import { join } from 'path'
import { initialSSRDevProxy } from 'tiger-server-utils'

@Configuration({
  imports: [
    web
  ],
  importConfigs: [join(__dirname, './config')]
})
export class ContainerLifeCycle {
  @App()
  app: web.Application

  async onReady () {
    await initialSSRDevProxy(this.app)
  }
}
