import axios, { AxiosRequestConfig } from 'axios'

const instance = axios.create({
  baseURL: '/',
  timeout: 10000,
  withCredentials: true
})

instance.interceptors.request.use((_config: AxiosRequestConfig) => _config, async (error: any) => await Promise.reject(error))
instance.interceptors.response.use((response: any) => response, async (error: any) => await Promise.reject(error))

export default instance
