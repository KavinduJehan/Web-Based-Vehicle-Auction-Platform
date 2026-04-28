import client from './client'

export const listBids = (auctionId) =>
  client.get(`/auctions/${auctionId}/bids`)

export const placeBid = (auctionId, amount) =>
  client.post(`/auctions/${auctionId}/bids`, { amount })
