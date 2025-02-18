import { IWindow } from 'tiger-types-react'

declare global {
  interface Window {
    __USE_SSR__?: IWindow['__USE_SSR__']
    __INITIAL_DATA__?: IWindow['__INITIAL_DATA__']
  }
  const __isBrowser__: Boolean
}
