import request from 'supertest';
import { app, pool, truncateAll } from './helpers.js';

beforeAll(truncateAll);

// ── Registration ────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('creates a buyer account with isVerified false', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Buyer', email: 'buyer@test.com', password: 'Password1!', role: 'buyer' });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe('buyer');
    expect(res.body.isVerified).toBe(false);
    expect(res.body.password_hash).toBeUndefined(); // must never leak hash
  });

  it('blocks admin self-registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Hacker', email: 'hack@test.com', password: 'Password1!', role: 'admin' });
    expect(res.status).toBe(400);
  });

  it('rejects duplicate email with 409', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'Password1!', role: 'buyer' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice2', email: 'alice@test.com', password: 'Password1!', role: 'buyer' });
    expect(res.status).toBe(409);
  });

  it('rejects password shorter than 8 chars', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'bob@test.com', password: 'short', role: 'buyer' });
    expect(res.status).toBe(400);
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@test.com', password: 'Password1!' });
    expect(res.status).toBe(400);
  });
});

// ── Login ────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Login User', email: 'login@test.com', password: 'Password1!', role: 'buyer' });
  });

  it('sets an HttpOnly cookie and returns user on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'Password1!' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeUndefined();       // token must NOT be in the body
    expect(res.body.user.email).toBe('login@test.com');
    expect(res.body.user.isVerified).toBe(false);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(c => c.startsWith('token='))).toBe(true);
    expect(cookies.some(c => c.toLowerCase().includes('httponly'))).toBe(true);
  });

  it('embeds isVerified in the token payload', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'Password1!' });
    // Extract token from Set-Cookie header and decode
    const cookieHeader = res.headers['set-cookie'].find(c => c.startsWith('token='));
    const tokenValue = cookieHeader.split(';')[0].split('=')[1];
    const [, payloadB64] = tokenValue.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    expect(payload.isVerified).toBe(false);
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'WrongPass1!' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'Password1!' });
    expect(res.status).toBe(401);
  });

  it('does not set a persistent login cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'Password1!' });

    const cookieHeader = res.headers['set-cookie'].find(c => c.startsWith('token='));
    expect(cookieHeader.toLowerCase()).not.toContain('max-age=');
    expect(cookieHeader.toLowerCase()).not.toContain('expires=');
  });
});
