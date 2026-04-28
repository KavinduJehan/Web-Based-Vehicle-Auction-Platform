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

// ── PATCH /users/:id/verify ───────────────────────────────────────────────────

describe('PATCH /api/users/:id/verify', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).patch(`/api/users/${buyerId}/verify`);
    expect(res.status).toBe(401);
  });

  it('returns 403 for a buyer trying to verify another user', async () => {
    const res = await request(app)
      .patch(`/api/users/${buyerId}/verify`)
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(res.status).toBe(403);
  });

  it('returns 404 for a non-existent user ID', async () => {
    const res = await request(app)
      .patch('/api/users/99999/verify')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('returns 200 and isVerified true when admin verifies a user', async () => {
    const res = await request(app)
      .patch(`/api/users/${buyerId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.isVerified).toBe(true);
    expect(res.body.id).toBe(buyerId);
  });

  it('returns 409 if the user is already verified', async () => {
    // Second attempt on the same user
    const res = await request(app)
      .patch(`/api/users/${buyerId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });

  it('new token after verify carries isVerified true', async () => {
    // The buyer must log in again to get a fresh token
    const buyer = await createBuyer({ email: 'fresh@test.com' });
    await request(app)
      .patch(`/api/users/${buyer.id}/verify`)
      .set('Authorization', `Bearer ${adminToken}`);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fresh@test.com', password: 'BuyerPass1!' });

    const [, payloadB64] = loginRes.body.token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    expect(payload.isVerified).toBe(true);
  });
});
