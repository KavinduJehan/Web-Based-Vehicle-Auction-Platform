## Deploy ThaproAUTO — Railway + Vercel

---

### Step 1 — Push latest code to GitHub
```powershell
cd "c:\Personal Files\Semester 5 BIT\Project"
git add -A
git commit -m "Production ready"
git push origin main
```

---

### Step 2 — Railway: Create project

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → select your repo
2. When it asks to configure: set **Root Directory** → Backend
3. It will auto-detect Node.js. Leave everything else as-is, click **Deploy**

---

### Step 3 — Railway: Add PostgreSQL

In the same Railway project → **+ New** → **Database** → **Add PostgreSQL**

Railway automatically links `DATABASE_URL` to your backend service. Done.

---

### Step 4 — Railway: Set environment variables

Your backend service → **Variables** tab → add these:

| Variable | Value |
|---|---|
| `JWT_SECRET` | Run this locally and paste the output: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `NODE_ENV` | `production` |
| `JWT_EXPIRES_IN` | `7d` |
| `BCRYPT_ROUNDS` | `10` |
| `ALLOWED_ORIGINS` | leave blank for now — you'll fill this after Step 7 |

Click **Deploy** and wait for it to go green.

---

### Step 5 — Railway: Run migrations

Your backend service → **Settings** → scroll to **Shell** → click **Open Shell**, then run each line:

```bash
psql $DATABASE_URL -f migrations/001_initial_schema.sql
psql $DATABASE_URL -f migrations/002_bids_auction_id.sql
psql $DATABASE_URL -f migrations/003_auction_winner.sql
psql $DATABASE_URL -f migrations/004_vehicle_fields.sql
psql $DATABASE_URL -f migrations/005_user_verification_status.sql
psql $DATABASE_URL -f migrations/006_auction_min_increment.sql
psql $DATABASE_URL -f migrations/007_auction_reserve_price.sql
psql $DATABASE_URL -f migrations/008_vehicle_chassis_unique.sql
```

---

### Step 6 — Railway: Seed admin accounts

Same shell:
```bash
node scripts/seed-admins.js
```

You should see:
```
[CREATED] owner@thaproauto.com (admin)
[CREATED] owner2@thaproauto.com (admin)
```

Note your Railway backend URL — shown at the top of the service page, e.g. `https://thaproauto-backend.up.railway.app`

---

### Step 7 — Vercel: Deploy frontend

1. [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo
2. Set **Root Directory** → Frontend
3. Framework will auto-detect as **Vite**
4. **Environment Variables** — add these before clicking Deploy:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-railway-url.up.railway.app/api` |
| `VITE_CLOUDINARY_CLOUD_NAME` | `dvko4jtlc` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | `vehicle_img` |

5. Click **Deploy**. Note your Vercel URL e.g. `https://thaproauto.vercel.app`

---

### Step 8 — Railway: Set ALLOWED_ORIGINS

Back in Railway → your backend service → **Variables** → set:

| Variable | Value |
|---|---|
| `ALLOWED_ORIGINS` | `https://thaproauto.vercel.app` ← your actual Vercel URL |

Railway will auto-redeploy.

---

### Step 9 — Verify it works

1. Open your Vercel URL
2. Login with `owner@thaproauto.com` / `ChangeMe1!`
3. **Change the password immediately** via Profile
4. Repeat for `owner2@thaproauto.com` / `ChangeMe2!`

---

### Step 10 — Custom domain (when ready)

- **Vercel:** Project → Settings → Domains → add your domain
- **Railway:** Service → Settings → Networking → add `api.yourdomain.com`
- Update `ALLOWED_ORIGINS` in Railway to your custom domain
- Update `VITE_API_URL` in Vercel to `https://api.yourdomain.com/api`
- Redeploy both