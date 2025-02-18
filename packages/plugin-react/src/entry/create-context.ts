// @ts-nocheck
// The file is provisional，don't depend on it

import React, { Context } from 'react'
import { IContext } from 'tiger-types-react'

let STORE_CONTEXT: Context<IContext>
if (__isBrowser__) {
  STORE_CONTEXT = window.STORE_CONTEXT || React.createContext<IContext>({
    state: {}
  })
  window.STORE_CONTEXT = STORE_CONTEXT
} else {
  STORE_CONTEXT = React.createContext<IContext>({
    state: {}
  })
}

export {
  STORE_CONTEXT
}
