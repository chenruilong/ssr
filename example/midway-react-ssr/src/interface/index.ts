import { IIndexPageFetchData } from '~/typings/data'

export interface IApiService {
  index: () => Promise<IIndexPageFetchData>
}

export * from './detail'
