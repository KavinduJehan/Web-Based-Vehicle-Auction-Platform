import request from 'supertest';
import { app, pool, truncateAll, createAdmin, createBuyer, loginAs } from './helpers.js';

let adminToken;
let unverifiedToken;
let verifiedToken;
let auctionId;
let inactiveAuctionId;

const vehicleBody = {
  title: 'Bid Test Car',
  description: 'Test vehicle for bidding',
  make: 'Honda',
  model: 'Civic',
  year: 2019,
  startingPrice: 10000,
  status: 'listed'
};

beforeAll(async () => {
  await truncateAll();

  const admin = await createAdmin();
  adminToken = await loginAs(admin);

  // Create a vehicle, then an active auction for it
  const vRes = await request(app)
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(vehicleBody);
  const vehicleId = vRes.body.id;

  const aRes = await request(app)
    .post('/api/auctions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ vehicleId, title: 'Active Auction', status: 'active' });
  auctionId = aRes.body.id;

  // A second vehicle + draft auction (not active — bids should be rejected)
  const vRes2 = await request(app)
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ ...vehicleBody, title: 'Inactive Auction Car' });
  const inactiveARes = await request(app)
    .post('/api/auctions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ vehicleId: vRes2.body.id, title: 'Draft Auction', status: 'draft' });
  inactiveAuctionId = inactiveARes.body.id;

  // Unverified buyer
  const unverified = await createBuyer({ email: 'unverified@test.com' });
  unverifiedToken = await loginAs(unverified);

  // Verified buyer (created as already verified so their JWT token has isVerified: true)
  const verified = await createBuyer({ email: 'verified@test.com', isVerified: true });
  verifiedToken = await loginAs(verified);
});

// ── Access control ────────────────────────────────────────────────────────────

describe('POST /api/auctions/:auctionId/bids', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/bids`)
      .send({ amount: 11000 });
    expect(res.status).toBe(401);
  });

  it('returns 403 for admin (buyer-only route)', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/bids`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 11000 });
    expect(res.status).toBe(403);
  });

  it('returns 403 for an unverified buyer', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/bids`)
      .set('Authorization', `Bearer ${unverifiedToken}`)
      .send({ amount: 11000 });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/verified/i);
  });
});

// ── Auction-state enforcement ─────────────────────────────────────────────────

describe('POST /api/auctions/:auctionId/bids — auction state', () => {
  it('returns 400 when the auction is not active', async () => {
    const res = await request(app)
      .post(`/api/auctions/${inactiveAuctionId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 11000 });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/not active|not started|has ended/i);
  });

  it('returns 404 for a non-existent auction', async () => {
    const res = await request(app)
      .post('/api/auctions/99999/bids')
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 11000 });
    expect(res.status).toBe(404);
  });
});

// ── Bid rules ─────────────────────────────────────────────────────────────────

describe('POST /api/auctions/:auctionId/bids — bid rules', () => {
  it('returns 201 and records the bid for a verified buyer', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 11000 });
    expect(res.status).toBe(201);
    expect(Number(res.body.amount)).toBe(11000);
    expect(res.body.auction_id).toBe(auctionId);
  });

  it('rejects a bid equal to the current highest', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 11000 });
    expect(res.status).toBe(400);
  });

  it('rejects a bid lower than the current highest', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 5000 });
    expect(res.status).toBe(400);
  });

  it('accepts a bid higher than the current highest', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 15000 });
    expect(res.status).toBe(201);
    expect(Number(res.body.amount)).toBe(15000);
  });

  it('rejects a non-numeric amount', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 'lots' });
    expect(res.status).toBe(400);
  });
});

// ── Bid listing ───────────────────────────────────────────────────────────────

describe('GET /api/auctions/:auctionId/bids', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get(`/api/auctions/${auctionId}/bids`);
    expect(res.status).toBe(401);
  });

  it('admin sees all bids for an auction', async () => {
    const res = await request(app)
      .get(`/api/auctions/${auctionId}/bids`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('buyer sees only their own bids', async () => {
    const res = await request(app)
      .get(`/api/auctions/${auctionId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ── Minimum bid increment ─────────────────────────────────────────────────────

describe('POST /api/auctions/:auctionId/bids — min_increment', () => {
  let incrementAuctionId;

  beforeAll(async () => {
    // Create a fresh vehicle + active auction with min_increment = 500
    const vRes = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...vehicleBody, title: 'Increment Test Car' });

    const aRes = await request(app)
      .post('/api/auctions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ vehicleId: vRes.body.id, title: 'Increment Auction', status: 'active', minIncrement: 500 });
    incrementAuctionId = aRes.body.id;
    expect(aRes.body.min_increment).toBe('500.00');

    // Place a seed bid of 10000 to establish a highest
    await request(app)
      .post(`/api/auctions/${incrementAuctionId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 10000 });
  });

  it('rejects a bid that beats highest but is below min_increment', async () => {
    const res = await request(app)
      .post(`/api/auctions/${incrementAuctionId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 10499 }); // 10000 + 499 < 10000 + 500
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/500/);
  });

  it('rejects a bid exactly 1 below the required increment', async () => {
    const res = await request(app)
      .post(`/api/auctions/${incrementAuctionId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 10499 });
    expect(res.status).toBe(400);
  });

  it('accepts a bid exactly at highest + min_increment', async () => {
    const res = await request(app)
      .post(`/api/auctions/${incrementAuctionId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 10500 }); // exactly 10000 + 500
    expect(res.status).toBe(201);
    expect(Number(res.body.amount)).toBe(10500);
  });

  it('accepts a bid well above highest + min_increment', async () => {
    const res = await request(app)
      .post(`/api/auctions/${incrementAuctionId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 20000 }); // 10500 + 500 = 11000 minimum, 20000 > 11000
    expect(res.status).toBe(201);
  });

  it('rejects a bid that does not meet the next increment threshold', async () => {
    // highest is now 20000, increment is 500, so minimum is 20500
    const res = await request(app)
      .post(`/api/auctions/${incrementAuctionId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 20100 });
    expect(res.status).toBe(400);
  });
});

