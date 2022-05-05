interface UserInfo {
  id: number
  nickname: string
  avatar: string
  token: string
}

interface ClientInfo {
  platform: string
  version: string
}

interface HeadData {
  title: string
  description?: string
  keywords?: string
  [key: string]: any
}

interface PageInitDataBase {
  error?: any
  data?: any
}
declare module 'egg' {
  interface Context {
    setPageInitData: <T extends PageInitDataBase>(data: T) => void
    getPageInitData: (field: string) => void
    setPageHeadData: (data: HeadData) => void
    getPageHeadData: (field: string) => void
    get routeType (): string
    get isApiRoute (): boolean
    locals: {
      user: UserInfo | null
      clientInfo: ClientInfo | null
      initData: any
      headData: HeadData | {}
    }
  }
}

declare module 'http' {
  interface IncomingHttpHeaders {
    timestamp?: number
    version?: string
    debug?: string
    platform?: string
    sign?: string
  }
}
