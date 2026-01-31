import * as bidService from '../services/bidService.js';

export async function listBidsForVehicleController(req, res, next) {
  try {
    const bids = await bidService.listBidsForVehicle(req.params.vehicleId, req.user);
    res.json(bids);
  } catch (err) {
    next(err);
  }
}

export async function placeBidController(req, res, next) {
  try {
    const bid = await bidService.placeBid(req.params.vehicleId, req.body.amount, req.user);
    res.status(201).json(bid);
  } catch (err) {
    next(err);
  }
}
