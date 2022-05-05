import * as React from 'react'
// @ts-expect-error
import {FeRoutes as Routes, ErrorPage} from '_build/ssr-manual-routes'

import { ErrorPageProps } from 'tiger-types-react'

// const { ErrorPage } = Routes as ReactRoutesType

function Error (props: ErrorPageProps) {
    return ErrorPage ? <ErrorPage {...props} /> : (
      <div>code: {props.code}, message: {props.message}</div>
    )
}

export {
  Error
}
