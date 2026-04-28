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

// ── List (basic) ─────────────────────────────────────────────────────────────

describe('GET /api/vehicles', () => {
  it('returns 200 with paginated shape for unauthenticated requests', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(20);
    expect(typeof res.body.totalPages).toBe('number');
  });

  it('returns 400 for an invalid query param', async () => {
    const res = await request(app).get('/api/vehicles?status=unknown');
    expect(res.status).toBe(400);
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

// ── Filtering, pagination & search ────────────────────────────────────────────

describe('GET /api/vehicles — filters, pagination, search', () => {
  beforeAll(async () => {
    await truncateAll();
    const admin = await createAdmin({ email: 'filter-admin@test.com' });
    const tok = await loginAs(admin);

    const vehicles = [
      { title: 'Honda Civic 2018',    make: 'Honda',  model: 'Civic',  year: 2018, startingPrice: 8000,  status: 'listed',  description: 'reliable sedan' },
      { title: 'Honda Accord 2020',   make: 'Honda',  model: 'Accord', year: 2020, startingPrice: 15000, status: 'listed',  description: 'spacious car' },
      { title: 'Toyota Camry 2021',   make: 'Toyota', model: 'Camry',  year: 2021, startingPrice: 20000, status: 'active' , description: 'smooth ride' },
      { title: 'Toyota Hilux 2022',   make: 'Toyota', model: 'Hilux',  year: 2022, startingPrice: 30000, status: 'draft',   description: 'tough truck' },
      { title: 'Nissan Altima 2019',  make: 'Nissan', model: 'Altima', year: 2019, startingPrice: 12000, status: 'listed',  description: 'fuel efficient' },
    ];

    // Use 'listed' as status in the schema; Toyota Camry is status 'active' but schema only allows draft/listed/sold — use 'listed' for test purposes
    const normalized = vehicles.map(v => ({ ...v, status: v.status === 'active' ? 'listed' : v.status }));
    for (const v of normalized) {
      await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${tok}`)
        .send(v);
    }
  });

  it('returns all 5 vehicles by default', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(5);
    expect(res.body.data).toHaveLength(5);
  });

  it('filters by status', async () => {
    const res = await request(app).get('/api/vehicles?status=draft');
    expect(res.status).toBe(200);
    expect(res.body.data.every(v => v.status === 'draft')).toBe(true);
  });

  it('filters by make (case-insensitive)', async () => {
    const res = await request(app).get('/api/vehicles?make=honda');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.data.every(v => v.make.toLowerCase() === 'honda')).toBe(true);
  });

  it('filters by yearMin and yearMax', async () => {
    const res = await request(app).get('/api/vehicles?yearMin=2019&yearMax=2021');
    expect(res.status).toBe(200);
    expect(res.body.data.every(v => v.year >= 2019 && v.year <= 2021)).toBe(true);
    expect(res.body.total).toBe(3);
  });

  it('filters by priceMin and priceMax', async () => {
    const res = await request(app).get('/api/vehicles?priceMin=10000&priceMax=20000');
    expect(res.status).toBe(200);
    expect(res.body.data.every(v => Number(v.starting_price) >= 10000 && Number(v.starting_price) <= 20000)).toBe(true);
  });

  it('searches across title, make, model', async () => {
    const res = await request(app).get('/api/vehicles?search=civic');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].model).toBe('Civic');
  });

  it('respects limit and returns correct totalPages', async () => {
    const res = await request(app).get('/api/vehicles?limit=2&page=1');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.limit).toBe(2);
    expect(res.body.totalPages).toBe(3); // ceil(5/2)
  });

  it('returns page 2 with remaining items', async () => {
    const res = await request(app).get('/api/vehicles?limit=3&page=2');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2); // 5 total, page 2 of 3
    expect(res.body.page).toBe(2);
  });

  it('sorts by starting_price ascending', async () => {
    const res = await request(app).get('/api/vehicles?sortBy=starting_price&order=asc');
    expect(res.status).toBe(200);
    const prices = res.body.data.map(v => Number(v.starting_price));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('returns empty data array when no vehicles match', async () => {
    const res = await request(app).get('/api/vehicles?make=Ferrari');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.data).toHaveLength(0);
  });
});
