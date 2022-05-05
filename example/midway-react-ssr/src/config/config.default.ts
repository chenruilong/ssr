import { MidwayConfig, MidwayAppInfo } from '@midwayjs/core'
import { join } from 'path'

export default (appInfo: MidwayAppInfo) => {
  return {
    keys: 'midway-ssr-app-86293',
    egg: {
      static: {
        prefix: '/',
        dir: [join(appInfo.appDir, './build'), join(appInfo.appDir, './public'), join(appInfo.appDir, './build/client')]
      }
    }
  } as MidwayConfig
}
