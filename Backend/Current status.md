
---



### 🟡 Logic Gaps — Core features work partially

**4. Bid TODO is never enforced** (bidService.js)
- The comment says "enforce auction status and timing rules" but there's literally no auction lookup in `placeBid`. A buyer can bid on a vehicle with no auction, a closed auction, or one that hasn't started yet.

**5. Bids have no `auction_id`** — architecture problem
- bidRepository.js stores bids with only `vehicle_id`. If a vehicle is re-auctioned, `findHighestBid(vehicleId)` would return a bid from the *previous* auction as the current high bid. The bid must be scoped to an auction.

**6. `updateVehicle` silently wipes fields**
- vehicleService.js: passes raw `payload` straight to the repo. If a caller only sends `title`, the repo's `UPDATE` sets all other columns (`make`, `model`, `year`, etc.) to `undefined` → `NULL` in PostgreSQL. No merge with existing data.

**7. No auction status transitions**
- Auctions have a `status` field and `starts_at`/`ends_at` columns, but there's no mechanism (cron, trigger, or on-read logic) to move status from `draft` → `active` → `ended`. Status is only changed by manually calling `PUT /auctions/:id`. `listAuctions()` returns stale statuses.

**8. No winner tracking when an auction ends**
- No `winning_bid_id`, no `winner_user_id`, nothing in the auction or bid schema to record who won.

---

### 🟠 Missing functionality — Routes/operations that should exist but don't

**9. No route or service to look up a user by ID**
- userRepository.js only has `findByEmail` and `create`. No `findById`. There's no `GET /me` or `GET /users/:id` endpoint, even though the JWT carries a `sub` (user ID).

**10. Auction routes have no input validation**
- routes/vehicles.js uses `validate(vehicleSchema)`. routes/auctions.js has **no `validate()` call at all** on POST or PUT — any garbage body goes straight to the service.

**11. Auction DELETE is admin-only; sellers can't close their own auctions**
- auctions.js: `requireRole(['admin'])` for DELETE. A seller who created an auction can update it but can't delete it, which is likely unintentional.

**12. No way to get bids for an auction (only for a vehicle)**
- routes/bids.js: `GET /bids/vehicle/:vehicleId`. There's no `GET /auctions/:id/bids`. Given that the correct domain model is bids-per-auction, this route structure will need to change alongside fix #5.

---

### ⚪ Zero test coverage

- jest.config.cjs is set up, Supertest is installed, but there are **no test files** anywhere in the project. - Done

---

### Summary table

| # | Issue | File | Severity |
|---|-------|------|----------|
| 1 | No DB migrations | `migrations/` | 🔴 Blocker |
| 2 | Users can never log in (no verify flow) | authService.js | 🔴 Blocker |
| 3 | Anyone can self-assign admin role | `routes/auth.js` | 🔴 Security |
| 4 | Bid doesn't check auction state/time | bidService.js | 🟡 Logic |
| 5 | Bids not scoped to auction_id | bidRepository.js | 🟡 Logic |
| 6 | updateVehicle wipes unset fields to NULL | vehicleService.js | 🟡 Logic |
| 7 | Auction status never auto-transitions | auctionService.js | 🟡 Logic |
| 8 | No winner recorded when auction ends | schema/services | 🟡 Logic |
| 9 | No `findById` user / no `GET /me` | userRepository.js | 🟠 Missing |
| 10 | Auction POST/PUT has no Joi validation | `routes/auctions.js` | 🟠 Missing |
| 11 | Sellers can't delete their own auctions | `routes/auctions.js` | 🟠 Missing |
| 12 | No `GET /auctions/:id/bids` route | `routes/bids.js` | 🟠 Missing |
| 13 | Zero tests | — | ⚪ Coverage |



37/37. The test baseline is solid. Here's what's left ordered by priority:

---

## Next up — by impact

### 🔴 Do first (architecture, blocks other things)

**#5 — Bids must be scoped to `auction_id`, not just `vehicle_id`**  
This is the biggest remaining structural gap. Right now bids are stored against a vehicle. If a vehicle gets re-auctioned, the old bids pollute the new auction's highest-bid check. Every bid feature downstream depends on fixing this first — it needs a new migration column, updated repo, service, and routes. - Done

---

### 🟡 Do second (logic gaps, can be done in any order)

**#4 — `placeBid` never checks if the auction is active**  
After fixing #5, `placeBid` needs to look up the auction and reject bids if `status !== 'active'` or the current time is outside `starts_at / ends_at`.

**#6 — `updateVehicle` wipes unset fields to NULL**  
Quick fix — merge incoming payload with the existing DB row before calling the repo.

**#8 — No winner selection when an auction ends**  
Admin needs `POST /auctions/:id/winner` to record the winning bid. Needs a `winning_bid_id` column on the `auctions` table (new migration).

--- Done
---

### 🟠 Do third (missing features)

**#10 — Auction POST/PUT has no Joi validation**  
Add a schema + `validate()` call to routes/auctions.js — 10 min fix.

**#9 — No `GET /me` endpoint**  
`findById` is already in the repo. Just needs a route + controller.

**UC-05 — Vehicle listing fields incomplete**  
`chassis_number`, `mileage`, `grade`, `images` are missing from the schema and routes. Needs a migration + updated Joi schema.

**UC-04 — Admin can approve but not reject users**  
`is_verified` boolean needs to become a `status` enum (`pending` / `verified` / `rejected`) — migration + updated service/route.

---Done
---

### ⚪ Do last (UC completion, larger scope)

- UC-02: filtering, pagination, search on vehicle listings  - Done
- UC-03: minimum bid increment rule  - Done
- UC-06: full winner selection flow  - Done
- Notifications (email) — needs an external service, likely out of scope for now

---

**My recommendation:** Start with **#5 (auction_id on bids)** — want me to implement that now? It's the last architectural decision that will force a migration change, so getting it done before building anything else on top of bids is the right call.