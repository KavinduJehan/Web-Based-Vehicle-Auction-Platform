Server is up. Now run the smoke tests in order. Use Postman (you already have it in your project) or any HTTP client.

---

## Test 1 — Admin self-registration is blocked
```
POST http://localhost:3000/api/auth/register
Body: { "name": "Hacker", "email": "hack@test.com", "password": "password123", "role": "admin" }
```
**Expected: `400 Validation failed`**

---

## Test 2 — Register a buyer
```
POST http://localhost:3000/api/auth/register
Body: { "name": "Test Buyer", "email": "buyer@test.com", "password": "password123", "role": "buyer" }
```
**Expected: `201` with `isVerified: false`**

---

## Test 3 — Login as buyer
```
POST http://localhost:3000/api/auth/login
Body: { "email": "buyer@test.com", "password": "password123" }
```
**Expected: `200` with a token. Save it as `BUYER_TOKEN`.**

---

## Test 4 — Login as admin
```
POST http://localhost:3000/api/auth/login
Body: { "email": "<owner email from seed-admins.js>", "password": "<that password>" }
```
**Expected: `200` with a token. Save it as `ADMIN_TOKEN`.**

---

## Test 5 — Admin creates a vehicle
```
POST http://localhost:3000/api/vehicles
Authorization: Bearer <ADMIN_TOKEN>
Body: {
  "title": "2020 Toyota Land Cruiser",
  "description": "Low mileage, excellent condition",
  "make": "Toyota", "model": "Land Cruiser",
  "year": 2020, "startingPrice": 45000, "status": "listed"
}
```
**Expected: `201`. Note the `id` returned — save it as `VEHICLE_ID`.**

---

## Test 6 — Admin creates an auction for that vehicle
```
POST http://localhost:3000/api/auctions
Authorization: Bearer <ADMIN_TOKEN>
Body: {
  "vehicleId": <VEHICLE_ID>,
  "title": "Land Cruiser Auction",
  "status": "active"
}
```
**Expected: `201`.**

---

## Test 7 — Unverified buyer tries to bid (should be blocked)
```
POST http://localhost:3000/api/bids/vehicle/<VEHICLE_ID>
Authorization: Bearer <BUYER_TOKEN>
Body: { "amount": 46000 }
```
**Expected: `403` — "must be verified by an admin"**

---

## Test 8 — Admin verifies the buyer
Get the buyer's `id` from the register response in Test 2, then:
```
PATCH http://localhost:3000/api/users/<BUYER_ID>/verify
Authorization: Bearer <ADMIN_TOKEN>
```
**Expected: `200` with `isVerified: true`**

---

## Test 9 — Buyer logs in again for a fresh token
```
POST http://localhost:3000/api/auth/login
Body: { "email": "buyer@test.com", "password": "password123" }
```
**Expected: `200`. Save new token as `VERIFIED_BUYER_TOKEN`.**

---

## Test 10 — Verified buyer places a bid
```
POST http://localhost:3000/api/bids/vehicle/<VEHICLE_ID>
Authorization: Bearer <VERIFIED_BUYER_TOKEN>
Body: { "amount": 46000 }
```
**Expected: `201` with the bid recorded.**

---

Run these in sequence and tell me which one fails first (if any).




Reading the jest config and current state of the files I'll need to write tests against.  

Read [](file:///c%3A/Personal%20Files/Semester%205%20BIT/Project/Backend/package.json)

Read [](file:///c%3A/Personal%20Files/Semester%205%20BIT/Project/Backend/jest.config.cjs)

Reading jest config and app.js before touching anything, so I know exactly what needs to change.  

Read [](file:///c%3A/Personal%20Files/Semester%205%20BIT/Project/Backend/jest.config.cjs)

Read [](file:///c%3A/Personal%20Files/Semester%205%20BIT/Project/Backend/src/app.js)

Good. The project uses `"type": "module"` (ESM) — Jest needs `--experimental-vm-modules` to handle that. There's also a safety concern: tests must always hit a **separate test database**, never your dev DB. I'll build a guard for that.

Here's the full plan before I write code:
- Update jest.config.cjs to wire in a setup file
- Update the test script in package.json for ESM + force-exit
- Suppress morgan noise during tests in app.js
- Create `setEnv.cjs` — loads `.env.test` and fails loudly if `DATABASE_URL` isn't set (protects dev DB)
- Create `helpers.js` — shared DB setup/teardown and user factories
- Create 4 test files: `auth`, `vehicles`, `users`, `bids` 

Created 4 todos

Replacing 9 lines with 10 lines in [](file:///c%3A/Personal%20Files/Semester%205%20BIT/Project/Backend/jest.config.cjs), [](file:///c%3A/Personal%20Files/Semester%205%20BIT/Project/Backend/package.json), [](file:///c%3A/Personal%20Files/Semester%205%20BIT/Project/Backend/src/app.js)


```

```

```

```

```

```


Starting: *Create setEnv.cjs + helpers.js* (2/4)

Created [](file:///c%3A/Personal%20Files/Semester%205%20BIT/Project/Backend/src/__tests__/setEnv.cjs)

Created [](file:///c%3A/Personal%20Files/Semester%205%20BIT/Project/Backend/src/__tests__/helpers.js)

Starting: *Create auth.test.js + vehicles.test.js* (3/4)

Created [](file:///c%3A/Personal%20Files/Semester%205%20BIT/Project/Backend/src/__tests__/auth.test.js)

Created [](file:///c%3A/Personal%20Files/Semester%205%20BIT/Project/Backend/src/__tests__/vehicles.test.js)

Starting: *Create users.test.js + bids.test.js* (4/4)

Created [](file:///c%3A/Personal%20Files/Semester%205%20BIT/Project/Backend/src/__tests__/users.test.js)

Created [](file:///c%3A/Personal%20Files/Semester%205%20BIT/Project/Backend/src/__tests__/bids.test.js)

Completed: *Create users.test.js + bids.test.js* (4/4)

Done. Here's what to do to actually run the tests:

---

## Before running — one-time test DB setup

In your psql terminal (with PATH set):

```powershell
$env:PATH = "C:\Program Files\PostgreSQL\18\bin;" + $env:PATH
psql -U postgres -c "CREATE DATABASE vehicle_auction_test;"
psql -U postgres -d vehicle_auction_test -f "C:\Personal Files\Semester 5 BIT\Project\Backend\migrations\001_initial_schema.sql"
```

Then create `Backend/.env.test` (new file, same location as `.env`):

```
DATABASE_URL=postgres://postgres:21108@localhost:5432/vehicle_auction_test
JWT_SECRET=test-secret
```

---

## Run the tests

```powershell
cd "C:\Personal Files\Semester 5 BIT\Project\Backend"
npm test
```

---

## What's covered (30 tests across 4 files)

| File | Tests |
|---|---|
| auth.test.js | Register buyer ✓, block admin registration ✓, duplicate email ✓, bad password ✓, login + token ✓, 401 cases ✓ |
| vehicles.test.js | Public list ✓, create/update/delete — 401/403/200/204 per role ✓ |
| users.test.js | Verify flow ✓, 401/403/404/409 ✓, fresh token has `isVerified: true` ✓ |
| bids.test.js | Unverified buyer blocked ✓, verified buyer succeeds ✓, bid outbid rules ✓, admin can't bid ✓, list bids ✓ |

If the test DB setup fails for any reason, Jest will fail immediately with a clear message telling you exactly what to create — it will never silently hit your dev DB.

Made changes.