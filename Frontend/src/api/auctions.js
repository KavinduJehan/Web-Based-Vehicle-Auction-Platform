import client from './client'

export const listAuctions = () => client.get('/auctions')
export const getAuction   = (id) => client.get(`/auctions/${id}`)
export const createAuction = (data) => client.post('/auctions', data)
export const updateAuction = (id, data) => client.put(`/auctions/${id}`, data)
export const deleteAuction = (id) => client.delete(`/auctions/${id}`)
export const closeAuction  = (id) => client.post(`/auctions/${id}/close`)
export const setWinner     = (id, bidId) => client.post(`/auctions/${id}/winner`, { bidId })
export const getWinner     = (id) => client.get(`/auctions/${id}/winner`)
