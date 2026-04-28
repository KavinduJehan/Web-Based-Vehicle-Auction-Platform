import request from 'supertest';
import { app, pool, truncateAll, createAdmin, createBuyer, loginAs } from './helpers.js';

let adminToken;
let unverifiedToken;
let verifiedToken;
let vehicleId;

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

  // Admin creates a vehicle to bid on
  const admin = await createAdmin();
  adminToken = await loginAs(admin);

  const vRes = await request(app)
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(vehicleBody);
  vehicleId = vRes.body.id;

  // Unverified buyer
  const unverified = await createBuyer({ email: 'unverified@test.com' });
  unverifiedToken = await loginAs(unverified);

  // Verified buyer — created directly as verified so their token has isVerified: true
  const verified = await createBuyer({ email: 'verified@test.com', isVerified: true });
  verifiedToken = await loginAs(verified);
});

// ── Bid access control ────────────────────────────────────────────────────────

describe('POST /api/bids/vehicle/:vehicleId', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post(`/api/bids/vehicle/${vehicleId}`)
      .send({ amount: 11000 });
    expect(res.status).toBe(401);
  });

  it('returns 403 for admin (buyer-only route)', async () => {
    const res = await request(app)
      .post(`/api/bids/vehicle/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 11000 });
    expect(res.status).toBe(403);
  });

  it('returns 403 for an unverified buyer', async () => {
    const res = await request(app)
      .post(`/api/bids/vehicle/${vehicleId}`)
      .set('Authorization', `Bearer ${unverifiedToken}`)
      .send({ amount: 11000 });
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/verified/i);
  });

  it('returns 201 and records the bid for a verified buyer', async () => {
    const res = await request(app)
      .post(`/api/bids/vehicle/${vehicleId}`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 11000 });
    expect(res.status).toBe(201);
    expect(Number(res.body.amount)).toBe(11000);
    expect(res.body.vehicle_id).toBe(vehicleId);
  });

  it('rejects a bid equal to the current highest', async () => {
    const res = await request(app)
      .post(`/api/bids/vehicle/${vehicleId}`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 11000 });
    expect(res.status).toBe(400);
  });

  it('rejects a bid lower than the current highest', async () => {
    const res = await request(app)
      .post(`/api/bids/vehicle/${vehicleId}`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 5000 });
    expect(res.status).toBe(400);
  });

  it('accepts a bid higher than the current highest', async () => {
    const res = await request(app)
      .post(`/api/bids/vehicle/${vehicleId}`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 15000 });
    expect(res.status).toBe(201);
    expect(Number(res.body.amount)).toBe(15000);
  });

  it('rejects a non-numeric amount', async () => {
    const res = await request(app)
      .post(`/api/bids/vehicle/${vehicleId}`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 'lots' });
    expect(res.status).toBe(400);
  });
});

// ── Bid listing ───────────────────────────────────────────────────────────────

describe('GET /api/bids/vehicle/:vehicleId', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get(`/api/bids/vehicle/${vehicleId}`);
    expect(res.status).toBe(401);
  });

  it('admin sees all bids for a vehicle', async () => {
    const res = await request(app)
      .get(`/api/bids/vehicle/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('buyer sees only their own bids', async () => {
    const res = await request(app)
      .get(`/api/bids/vehicle/${vehicleId}`)
      .set('Authorization', `Bearer ${verifiedToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
