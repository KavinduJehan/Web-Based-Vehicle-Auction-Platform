import client from './client'

export const listBids = (auctionId,userId) =>
  client.get(`/auctions/${auctionId}/bids`)

export const useri = (userId) =>
  client.get(`/user/${id}`)

export const placeBid = (auctionId, amount) =>
  client.post(`/auctions/${auctionId}/bids`, { amount })


