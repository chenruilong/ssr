export interface IPageRender {
    (props: any): any
    Loading?: any
    Layout?: any
    layoutInitialProps?: any
}

export interface RequestError {
    message: string
    code: number
    name: string
}

export interface SSRRequestData {
    error: RequestError
    data: Object
}

export interface LayoutInitData {
    userInfo?: object
}

export interface HttpApiResponse<T = any> {
    code: number
    msg: string
    data: T
    status: any
}
