import React, { useContext } from 'react'
import {Link} from 'react-router-dom'
import { SProps, IContext, IPageHead } from 'tiger-types-react'

import { IIndexPageFetchData } from '~/typings/data'
import { STORE_CONTEXT } from '_build/create-context'

function Index (props: SProps) {
  const { state, dispatch } = useContext<IContext<IIndexPageFetchData>>(STORE_CONTEXT)
  return (
    <div>
      Index, data: {state?.indexData.text} <br />
      <Link className='test' to="/detail/1">去详情</Link>
      </div>
  )
}

Index.Head = (state: IIndexPageFetchData): IPageHead => {
  return {
    title: state.indexData.text,
    description: '描述',
    keywords: ''
  }
}

export default Index
