
---

# 🚀 FRONTEND EXECUTION PLAN (TRACKABLE)

## 🎯 Definition of DONE (important)

Your frontend is “done” when:

* A buyer can: register → login → browse → bid
* An admin can: create vehicle → create auction → close → assign winner
* System shows correct states + errors

Everything below drives toward that.

---

# 🧱 SLICE 1 — SYSTEM IS ALIVE (CORE FLOW)

## Goal

Buyer can **register → login → view auctions → place bid**

---

## 🔹 1. Project Setup

### Tasks

* [ ] Create Vite React app
* [ ] Install dependencies:

  * `react-router-dom`
  * `axios`
  * `tailwindcss`
* [ ] Configure Tailwind
* [ ] Setup folder structure:

  ```
  src/
    api/
    context/
    pages/
    components/
  ```

---

## 🔹 2. Axios Client

### Tasks

* [ ] Create `api/client.js`
* [ ] Set `baseURL = /api`
* [ ] Add interceptor:

  * attach JWT from `localStorage`

### Done when:

* Any request automatically sends token

---

## 🔹 3. Auth Context

### Tasks

* [ ] Create `AuthContext.jsx`
* [ ] Store:

  * token
  * user (decoded)
* [ ] Implement:

  * `login(token)`
  * `logout()`
* [ ] Persist token in `localStorage`

### Done when:

* Refresh does NOT log user out

---

## 🔹 4. Auth Pages

### Login

* [ ] Form (email + password)
* [ ] Call `/api/auth/login`
* [ ] Save token
* [ ] Redirect:

  * admin → `/admin`
  * buyer → `/auctions`

### Register

* [ ] Form
* [ ] Call `/api/auth/register`

### Done when:

* You can login and stay logged in

---

## 🔹 5. Auction List Page

### Tasks

* [ ] GET `/api/auctions`
* [ ] Render list
* [ ] Show:

  * title
  * status
  * current price

### Done when:

* Auctions appear correctly

---

## 🔹 6. Auction Detail Page

### Tasks

* [ ] GET `/api/auctions/:id`
* [ ] Show:

  * vehicle info
  * highest bid
  * status

---

## 🔹 7. Bid Form (CRITICAL)

### Tasks

* [ ] Input field for amount
* [ ] POST `/api/auctions/:id/bids`
* [ ] Handle errors:

  * not verified → show message
  * invalid bid → show message

### Done when:

* Verified user can place a valid bid successfully

---

## ✅ SLICE 1 COMPLETE WHEN:

* Full buyer flow works end-to-end

---

# 🧱 SLICE 2 — ADMIN SUPPLIES DATA

## Goal

Admin can create vehicles and auctions

---

## 🔹 1. Admin Route Protection

* [ ] Create `ProtectedRoute`
* [ ] Restrict admin pages

---

## 🔹 2. Vehicle Creation

### Tasks

* [ ] Form
* [ ] POST `/api/vehicles`
* [ ] Include:

  * make, model, year, price, etc.

---

## 🔹 3. Auction Creation

### Tasks

* [ ] Form
* [ ] Select vehicle
* [ ] Set:

  * start time
  * end time
  * min increment
* [ ] POST `/api/auctions`

---

## ✅ SLICE 2 COMPLETE WHEN:

* Admin creates auction → appears in auction list

---

# 🧱 SLICE 3 — FULL LIFECYCLE

## Goal

Auction can be closed and winner selected

---

## 🔹 1. Close Auction

* [ ] Button → POST `/api/auctions/:id/close`

---

## 🔹 2. Select Winner (manual)

* [ ] Show bids
* [ ] Button → POST `/api/auctions/:id/winner`

---

## 🔹 3. Winner Page

* [ ] GET `/api/auctions/:id/winner`
* [ ] Show winner details

---

## 🔹 4. Buyer Profile

* [ ] GET `/api/users/me`

---

## 🔹 5. Bid History

* [ ] GET `/api/auctions/:id/bids`

---

## ✅ SLICE 3 COMPLETE WHEN:

* Auction → closed → winner visible → buyer sees results

---

# 🧱 SLICE 4 — BROWSING EXPERIENCE

## Goal

Improve usability

---

## Tasks

* [ ] Vehicle list page
* [ ] Filters:

  * make, year, price
* [ ] Pagination
* [ ] Search

---

## ✅ Done when:

* Data can be filtered and navigated

---

# 🧱 SLICE 5 — ADMIN MANAGEMENT

## Goal

Complete admin control

---

## Tasks

* [ ] Vehicle CRUD
* [ ] Auction CRUD
* [ ] User verification:

  * approve / reject

---

## ✅ Done when:

* Admin fully controls system

---

# 🧱 SLICE 6 — POLISH

## Tasks

* [ ] Countdown timer
* [ ] Status badges
* [ ] Loading states
* [ ] Error messages
* [ ] Responsive layout

---

## ✅ Done when:

* UI looks complete and usable

---
