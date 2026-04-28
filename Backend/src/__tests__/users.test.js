import request from 'supertest';
import { app, pool, truncateAll, createAdmin, createBuyer, loginAs } from './helpers.js';

let adminToken;
let buyerToken;
let buyerId;

beforeAll(async () => {
  await truncateAll();
  const admin = await createAdmin();
  const buyer = await createBuyer();
  buyerId    = buyer.id;
  adminToken = await loginAs(admin);
  buyerToken  = await loginAs(buyer);
});

// ── GET /api/users/me ─────────────────────────────────────────────────────────

describe('GET /api/users/me', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('returns the caller\'s own profile', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(buyerId);
    expect(res.body.role).toBe('buyer');
    expect(res.body.verificationStatus).toBe('pending');
    expect(res.body.password_hash).toBeUndefined();
  });
});

// ── PATCH /api/users/:id/status ───────────────────────────────────────────────

describe('PATCH /api/users/:id/status', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app)
      .patch(`/api/users/${buyerId}/status`)
      .send({ status: 'verified' });
    expect(res.status).toBe(401);
  });

  it('returns 403 for a buyer', async () => {
    const res = await request(app)
      .patch(`/api/users/${buyerId}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'verified' });
    expect(res.status).toBe(403);
  });

  it('returns 400 for an invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/users/${buyerId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'pending' }); // 'pending' cannot be set via API
    expect(res.status).toBe(400);
  });

  it('returns 404 for a non-existent user ID', async () => {
    const res = await request(app)
      .patch('/api/users/99999/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'verified' });
    expect(res.status).toBe(404);
  });

  it('returns 200 and verificationStatus verified when admin verifies a user', async () => {
    const res = await request(app)
      .patch(`/api/users/${buyerId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'verified' });
    expect(res.status).toBe(200);
    expect(res.body.verificationStatus).toBe('verified');
    expect(res.body.id).toBe(buyerId);
  });

  it('returns 409 when the user already has the requested status', async () => {
    const res = await request(app)
      .patch(`/api/users/${buyerId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'verified' });
    expect(res.status).toBe(409);
  });

  it('returns 200 and verificationStatus rejected when admin rejects a user', async () => {
    const target = await createBuyer({ email: 'reject-target@test.com' });
    const res = await request(app)
      .patch(`/api/users/${target.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'rejected' });
    expect(res.status).toBe(200);
    expect(res.body.verificationStatus).toBe('rejected');
  });

  it('new token after verify carries isVerified true', async () => {
    const buyer = await createBuyer({ email: 'fresh@test.com' });
    await request(app)
      .patch(`/api/users/${buyer.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'verified' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fresh@test.com', password: 'BuyerPass1!' });

    const [, payloadB64] = loginRes.body.token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    expect(payload.isVerified).toBe(true);
  });
});

