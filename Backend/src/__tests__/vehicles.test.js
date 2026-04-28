import request from 'supertest';
import { app, pool, truncateAll, createAdmin, createBuyer, loginAs } from './helpers.js';

let adminToken;
let buyerToken;

const vehicleBody = {
  title: '2020 Toyota Hilux',
  description: 'Good condition',
  make: 'Toyota',
  model: 'Hilux',
  year: 2020,
  startingPrice: 25000,
  status: 'draft'
};

beforeAll(async () => {
  await truncateAll();
  const admin = await createAdmin();
  const buyer = await createBuyer();
  adminToken = await loginAs(admin);
  buyerToken  = await loginAs(buyer);
});

// ── List ─────────────────────────────────────────────────────────────────────

describe('GET /api/vehicles', () => {
  it('returns 200 with an array for unauthenticated requests', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ── Create ────────────────────────────────────────────────────────────────────

describe('POST /api/vehicles', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/vehicles').send(vehicleBody);
    expect(res.status).toBe(401);
  });

  it('returns 403 for a buyer (not admin)', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send(vehicleBody);
    expect(res.status).toBe(403);
  });

  it('returns 201 and the created vehicle for an admin', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(vehicleBody);
    expect(res.status).toBe(201);
    expect(res.body.make).toBe('Toyota');
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Incomplete' });
    expect(res.status).toBe(400);
  });
});

// ── Update ────────────────────────────────────────────────────────────────────

describe('PUT /api/vehicles/:id', () => {
  let vehicleId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(vehicleBody);
    vehicleId = res.body.id;
  });

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .send(vehicleBody);
    expect(res.status).toBe(401);
  });

  it('returns 403 for a buyer', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send(vehicleBody);
    expect(res.status).toBe(403);
  });

  it('returns 200 and updated fields for admin', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...vehicleBody, title: 'Updated Hilux' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated Hilux');
  });
});

// ── Delete ────────────────────────────────────────────────────────────────────

describe('DELETE /api/vehicles/:id', () => {
  let vehicleId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(vehicleBody);
    vehicleId = res.body.id;
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).delete(`/api/vehicles/${vehicleId}`);
    expect(res.status).toBe(401);
  });

  it('returns 204 for admin', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 for already-deleted vehicle', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
