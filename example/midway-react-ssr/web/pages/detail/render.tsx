import React, { useContext } from 'react'
import { IContext, IPageHead, SProps } from 'tiger-types-react'
import {Link} from 'react-router-dom'

import { IDetailPageFetchData } from '~/typings/data'
import { STORE_CONTEXT } from '_build/create-context'

function Detail (props: SProps) {
  const { state, dispatch } = useContext<IContext<IDetailPageFetchData>>(STORE_CONTEXT)
  return (
    <div>
      Detail, {state?.detailData.text}<br/>
    <Link to="/">去首页</Link>
    </div>
  )
}

Detail.Loading = () => {
  return (
    <div>loading</div>
  )
}

Detail.Head = (state: IDetailPageFetchData): IPageHead => {
  return {
    title: '详情',
    description: state.detailData.text,
    keywords: ''
  }
}

export default Detail
