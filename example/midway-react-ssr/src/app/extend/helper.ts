export default {
  catchAwait (fn, finallyFn) {
    if (!fn) return [new Error('no function')]

    return fn
      .then((data) => [undefined, data])
      .catch((error) => [error])
      .finally(() => typeof finallyFn === 'function' && finallyFn())
  },
  finallyAwait (fn, finallyFn) {
    if (!fn) return [new Error('no function')]

    return fn
      .then((data) => [undefined, data])
      .finally(() => typeof finallyFn === 'function' && finallyFn())
  },
  /**
   * 统一拼接页面title
   * */
  siteTitle (title: string, contact: boolean = true) {
      return contact ? title + ' - 品玩': title
  }
}
