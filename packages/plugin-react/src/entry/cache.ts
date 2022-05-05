export const cache = new Map()

export const setCache = (path: string, data = {}) => {
  cache.set(path, data)
}

export const getCache = (path: string) => {
  return cache.get(path)
}
