
import React from 'react'
import { DocumentProps } from 'tiger-types-react'
import App from './app'

const Document = (props: DocumentProps) => {
  // 注：Layout 只会在服务端被渲染，不要在此运行客户端有关逻辑
  const { injectState } = props
  const { injectCss, injectScript } = props.staticList!
  // @ts-expect-error
  const { injectHead } = props.ctx!

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        { injectHead }
        <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no' />
        { injectCss }
      </head>
      <body>
        <div id="app"><App {...props} /></div>
        { injectState }
        { injectScript }
      </body>
    </html>
  )
}

export default Document
