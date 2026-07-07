import * as reportService from '../services/reportService.js';

export async function getSummaryReport(req, res, next) {
  try {
    const data = await reportService.getSummaryReport();
    res.json(data);
  } catch (err) {
    next(err);
  }
}
