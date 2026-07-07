import * as reportRepository from '../repositories/reportRepository.js';

export async function getSummaryReport() {
  const [overview, auctions, buyers, inventory] = await Promise.all([
    reportRepository.getOverview(),
    reportRepository.getAuctionReport(),
    reportRepository.getBuyerReport(),
    reportRepository.getInventoryReport(),
  ]);
  return { overview, auctions, buyers, inventory };
}
