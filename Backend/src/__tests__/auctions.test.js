import request from 'supertest';
import { app, truncateAll, createAdmin, createBuyer, loginAs } from './helpers.js';

let adminToken;
let verifiedToken;
let auctionId;
let bidId;

// A second auction + bid used only for the close/winner tests (must stay unended for them)
let closeAuctionId;
let closeBidId;
let noWinnerAuctionId;

const vehicleBody = {
  title: 'Winner Test Car',
  description: 'Test vehicle',
  make: 'Toyota',
  model: 'Camry',
  year: 2021,
  startingPrice: 20000,
  status: 'listed'
};

beforeAll(async () => {
  await truncateAll();

  const admin = await createAdmin();
  adminToken = await loginAs(admin);

  const buyer = await createBuyer({ email: 'winner-buyer@test.com', isVerified: true });
  verifiedToken = await loginAs(buyer);

  // ── Auction A — used for manual selectWinner tests ──
  const vA = await request(app)
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(vehicleBody);
  const aA = await request(app)
    .post('/api/auctions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ vehicleId: vA.body.id, title: 'Winner Test Auction', status: 'active' });
  auctionId = aA.body.id;
  const bA = await request(app)
    .post(`/api/auctions/${auctionId}/bids`)
    .set('Authorization', `Bearer ${verifiedToken}`)
    .send({ amount: 25000 });
  bidId = bA.body.id;

  // ── Auction B — used for auto-close tests ──
  const vB = await request(app)
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ ...vehicleBody, title: 'Close Test Car' });
  const aB = await request(app)
    .post('/api/auctions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ vehicleId: vB.body.id, title: 'Close Test Auction', status: 'active' });
  closeAuctionId = aB.body.id;
  const bB = await request(app)
    .post(`/api/auctions/${closeAuctionId}/bids`)
    .set('Authorization', `Bearer ${verifiedToken}`)
    .send({ amount: 30000 });
  closeBidId = bB.body.id;

  // ── Auction C — active with no bids (tests close with no winner) ──
  const vC = await request(app)
    .post('/api/vehicles')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ ...vehicleBody, title: 'No Bid Car' });
  const aC = await request(app)
    .post('/api/auctions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ vehicleId: vC.body.id, title: 'No Bid Auction', status: 'active' });
  noWinnerAuctionId = aC.body.id;
});

// ── POST /api/auctions/:id/winner (manual selection) ─────────────────────────

describe('POST /api/auctions/:id/winner', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/winner`)
      .send({ bidId });
    expect(res.status).toBe(401);
  });

  it('returns 403 for a buyer', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/winner`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ bidId });
    expect(res.status).toBe(403);
  });

  it('returns 400 when bidId is missing', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/winner`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('returns 404 for a non-existent auction', async () => {
    const res = await request(app)
      .post('/api/auctions/99999/winner')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bidId });
    expect(res.status).toBe(404);
  });

  it('returns 404 for a non-existent bid', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/winner`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bidId: 99999 });
    expect(res.status).toBe(404);
  });

  it('returns 400 when bid belongs to a different auction', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/winner`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bidId: closeBidId });
    expect(res.status).toBe(400);
  });

  it('returns 400 when the auction is still draft', async () => {
    const vD = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...vehicleBody, title: 'Draft Car' });
    const aD = await request(app)
      .post('/api/auctions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ vehicleId: vD.body.id, title: 'Draft Auction', status: 'draft' });
    const res = await request(app)
      .post(`/api/auctions/${aD.body.id}/winner`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bidId });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/draft/i);
  });

  it('returns 200, sets winning_bid_id and marks auction ended', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/winner`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bidId });
    expect(res.status).toBe(200);
    expect(res.body.winning_bid_id).toBe(bidId);
    expect(res.body.status).toBe('ended');
  });

  it('returns 409 when winner is already set', async () => {
    const res = await request(app)
      .post(`/api/auctions/${auctionId}/winner`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ bidId });
    expect(res.status).toBe(409);
  });
});

// ── GET /api/auctions/:id/winner ──────────────────────────────────────────────

describe('GET /api/auctions/:id/winner', () => {
  it('returns 404 when no winner has been set', async () => {
    const res = await request(app)
      .get(`/api/auctions/${closeAuctionId}/winner`);
    expect(res.status).toBe(404);
  });

  it('returns 404 for a non-existent auction', async () => {
    const res = await request(app).get('/api/auctions/99999/winner');
    expect(res.status).toBe(404);
  });

  it('returns winner details after winner is selected', async () => {
    // auctionId already has a winner set in the selectWinner suite above
    const res = await request(app)
      .get(`/api/auctions/${auctionId}/winner`);
    expect(res.status).toBe(200);
    expect(res.body.auctionId).toBe(auctionId);
    expect(res.body.status).toBe('ended');
    expect(res.body.winner).toMatchObject({
      email: 'winner-buyer@test.com',
    });
    expect(res.body.winningBid.bidId).toBe(bidId);
    expect(Number(res.body.winningBid.amount)).toBe(25000);
  });
});

// ── POST /api/auctions/:id/close (auto winner) ────────────────────────────────

describe('POST /api/auctions/:id/close', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post(`/api/auctions/${closeAuctionId}/close`);
    expect(res.status).toBe(401);
  });

  it('returns 403 for a buyer', async () => {
    const res = await request(app)
      .post(`/api/auctions/${closeAuctionId}/close`)
      .set('Authorization', `Bearer ${verifiedToken}`);
    expect(res.status).toBe(403);
  });

  it('returns 404 for a non-existent auction', async () => {
    const res = await request(app)
      .post('/api/auctions/99999/close')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('closes the auction and sets the highest bid as winner', async () => {
    const res = await request(app)
      .post(`/api/auctions/${closeAuctionId}/close`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ended');
    expect(res.body.winning_bid_id).toBe(closeBidId);
  });

  it('closes an auction with no bids (winning_bid_id stays null)', async () => {
    const res = await request(app)
      .post(`/api/auctions/${noWinnerAuctionId}/close`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ended');
    expect(res.body.winning_bid_id).toBeNull();
  });

  it('returns 409 when auction is already ended', async () => {
    const res = await request(app)
      .post(`/api/auctions/${closeAuctionId}/close`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });
});

// ── Status auto-transitions (on-read) ─────────────────────────────────────────

describe('Auction status auto-transitions', () => {
  let draftId;
  let expiredId;

  beforeAll(async () => {
    // Draft with starts_at already in the past → should read as 'active'
    const vDraft = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...vehicleBody, title: 'AutoTransition Draft Car' });
    const aDraft = await request(app)
      .post('/api/auctions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vehicleId: vDraft.body.id,
        title: 'AutoTransition Draft Auction',
        status: 'draft',
        startsAt: '2020-01-01T00:00:00Z',
        endsAt: '2099-01-01T00:00:00Z',
      });
    draftId = aDraft.body.id;

    // Active with ends_at already in the past → should read as 'ended'
    const vExpired = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...vehicleBody, title: 'AutoTransition Expired Car' });
    const aExpired = await request(app)
      .post('/api/auctions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        vehicleId: vExpired.body.id,
        title: 'AutoTransition Expired Auction',
        status: 'active',
        startsAt: '2020-01-01T00:00:00Z',
        endsAt: '2020-06-01T00:00:00Z',
      });
    expiredId = aExpired.body.id;
  });

  it('draft auction with past starts_at is returned as active', async () => {
    const res = await request(app).get(`/api/auctions/${draftId}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('active');
  });

  it('active auction with past ends_at is returned as ended', async () => {
    const res = await request(app).get(`/api/auctions/${expiredId}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ended');
  });

  it('listAuctions reflects computed status for all auctions', async () => {
    const res = await request(app).get('/api/auctions');
    expect(res.status).toBe(200);
    const draft   = res.body.find(a => a.id === draftId);
    const expired = res.body.find(a => a.id === expiredId);
    expect(draft.status).toBe('active');
    expect(expired.status).toBe('ended');
  });

  it('rejects a bid on a time-expired auction', async () => {
    const res = await request(app)
      .post(`/api/auctions/${expiredId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 50000 });
    expect(res.status).toBe(400);
  });

  it('allows a bid on a draft-turned-active auction', async () => {
    const res = await request(app)
      .post(`/api/auctions/${draftId}/bids`)
      .set('Authorization', `Bearer ${verifiedToken}`)
      .send({ amount: 21000 });
    expect(res.status).toBe(201);
  });
});

