import request from '@/services/request/main'

export default {
  async getIndexData () {
    const res = await request.get('csr/index')
    return res.data
  },
  async getDetailData (id?: string) {
    const res = await request.get(`csr/detail/${id}`)
    return res.data
  }
}
