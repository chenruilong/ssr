import * as path from 'path'
import type { UserConfig } from 'tiger-types'

const userConfig: UserConfig = {
    whiteList: [/@pingfe\/brick.*?style/],
    serverPort: 6500,
    nprogress: {
        showSpinner: true
    },
    css: () => ({
        loaderOptions: {
            cssOptions: {
                modules: {
                    auto: true,
                    exportLocalsConvention: 'camelCase',
                    localIdentName: '[hash:base64:18]',
                    // localIdentName: '[local]-[hash:base64:5]'
                }
            }
        }
    }),
    alias: {
        '@config': {
            development: path.resolve('./web/config/development'),
            test: path.resolve('./web/config/test'),
            production: path.resolve('./web/config/production')
        }[process.env.PROJECT_ENV || 'development'],
        '@site-packages': path.resolve('./site-public-packages')
    }
}

export { userConfig }
