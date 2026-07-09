import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { faker } from '@faker-js/faker';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const dataRoot = path.join(projectRoot, '..', 'Data');

const connectionString = process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);

const BUYER_COUNT = 24;
const SELLER_COUNT = 5;
const ADMIN_COUNT = 2;

const AUCTION_COUNTS = {
  completed: 5,
  active: 15,
  scheduled: 5,
  draft: 0,
};

const PROFILE_PLACEHOLDER = '/uploads/profiles/default-profile.png';
const DEMO_PASSWORD = 'Password1!';
const DEMO_ACCOUNTS = {
  admins: [
    { name: 'Demo Admin', email: 'admin@demo.example.com' },
    { name: 'Tapro Manager', email: 'manager@demo.example.com' },
  ],
  sellers: [
    { name: 'Tokyo Export Yard', email: 'seller1@demo.example.com' },
    { name: 'Osaka Motor Depot', email: 'seller2@demo.example.com' },
    { name: 'Nagoya Auto Link', email: 'seller3@demo.example.com' },
    { name: 'Kobe Trade Cars', email: 'seller4@demo.example.com' },
    { name: 'Yokohama Vehicle Hub', email: 'seller5@demo.example.com' },
  ],
  buyers: [
    { name: 'Demo Buyer', email: 'buyer@demo.example.com' },
    { name: 'Verified Importer', email: 'importer@demo.example.com' },
  ],
};

const VEHICLE_CATALOG = [
  { make: 'Toyota', model: 'Corolla', year: 2020, type: 'economy', basePrice: [14000, 22000], engine: ['1.6L', '1.8L'], fuel: ['Petrol', 'Hybrid'], drive: ['FWD'], trans: ['Automatic', 'CVT'] },
  { make: 'Toyota', model: 'Camry', year: 2021, type: 'mid', basePrice: [22000, 34000], engine: ['2.0L', '2.5L'], fuel: ['Petrol', 'Hybrid'], drive: ['FWD'], trans: ['Automatic'] },
  { make: 'Toyota', model: 'Hilux', year: 2022, type: 'pickup', basePrice: [30000, 52000], engine: ['2.4L', '2.8L'], fuel: ['Diesel'], drive: ['4WD', 'RWD'], trans: ['Automatic', 'Manual'] },
  { make: 'Honda', model: 'Civic', year: 2019, type: 'economy', basePrice: [15000, 26000], engine: ['1.5L', '1.8L'], fuel: ['Petrol'], drive: ['FWD'], trans: ['Automatic', 'CVT'] },
  { make: 'Honda', model: 'CR-V', year: 2021, type: 'suv', basePrice: [24000, 39000], engine: ['1.5L', '2.0L'], fuel: ['Petrol', 'Hybrid'], drive: ['FWD', 'AWD'], trans: ['Automatic', 'CVT'] },
  { make: 'Nissan', model: 'X-Trail', year: 2020, type: 'suv', basePrice: [22000, 36000], engine: ['2.0L', '2.5L'], fuel: ['Petrol'], drive: ['FWD', 'AWD'], trans: ['Automatic', 'CVT'] },
  { make: 'Nissan', model: 'Navara', year: 2022, type: 'pickup', basePrice: [29000, 48000], engine: ['2.3L', '2.5L'], fuel: ['Diesel'], drive: ['RWD', '4WD'], trans: ['Automatic', 'Manual'] },
  { make: 'Mazda', model: 'CX-5', year: 2021, type: 'suv', basePrice: [25000, 38000], engine: ['2.0L', '2.5L'], fuel: ['Petrol'], drive: ['FWD', 'AWD'], trans: ['Automatic'] },
  { make: 'Mitsubishi', model: 'Montero Sport', year: 2020, type: 'suv', basePrice: [26000, 42000], engine: ['2.4L'], fuel: ['Diesel'], drive: ['RWD', '4WD'], trans: ['Automatic'] },
  { make: 'Suzuki', model: 'Swift', year: 2021, type: 'economy', basePrice: [12000, 19000], engine: ['1.2L'], fuel: ['Petrol'], drive: ['FWD'], trans: ['Manual', 'Automatic'] },
  { make: 'Hyundai', model: 'Tucson', year: 2022, type: 'suv', basePrice: [25000, 40000], engine: ['1.6L', '2.0L'], fuel: ['Petrol', 'Hybrid'], drive: ['FWD', 'AWD'], trans: ['Automatic'] },
  { make: 'Kia', model: 'Sportage', year: 2021, type: 'suv', basePrice: [24000, 38000], engine: ['1.6L', '2.0L'], fuel: ['Petrol', 'Hybrid'], drive: ['FWD', 'AWD'], trans: ['Automatic'] },
  { make: 'Ford', model: 'Ranger', year: 2023, type: 'pickup', basePrice: [34000, 56000], engine: ['2.0L', '3.2L'], fuel: ['Diesel'], drive: ['RWD', '4WD'], trans: ['Automatic', 'Manual'] },
  { make: 'Ford', model: 'Mustang GT', year: 2020, type: 'sports', basePrice: [42000, 70000], engine: ['5.0L'], fuel: ['Petrol'], drive: ['RWD'], trans: ['Automatic', 'Manual'] },
  { make: 'BMW', model: '320i', year: 2021, type: 'luxury', basePrice: [38000, 56000], engine: ['2.0L'], fuel: ['Petrol'], drive: ['RWD'], trans: ['Automatic'] },
  { make: 'BMW', model: 'X5', year: 2022, type: 'luxury', basePrice: [68000, 98000], engine: ['3.0L'], fuel: ['Petrol', 'Diesel'], drive: ['AWD'], trans: ['Automatic'] },
  { make: 'Mercedes-Benz', model: 'C200', year: 2021, type: 'luxury', basePrice: [42000, 62000], engine: ['2.0L'], fuel: ['Petrol'], drive: ['RWD'], trans: ['Automatic'] },
  { make: 'Mercedes-Benz', model: 'GLC 300', year: 2022, type: 'luxury', basePrice: [62000, 90000], engine: ['2.0L'], fuel: ['Petrol'], drive: ['AWD'], trans: ['Automatic'] },
  { make: 'Audi', model: 'A4', year: 2020, type: 'luxury', basePrice: [39000, 58000], engine: ['2.0L'], fuel: ['Petrol'], drive: ['FWD', 'AWD'], trans: ['Automatic'] },
  { make: 'Audi', model: 'Q5', year: 2021, type: 'luxury', basePrice: [55000, 80000], engine: ['2.0L'], fuel: ['Petrol'], drive: ['AWD'], trans: ['Automatic'] },
  { make: 'Tesla', model: 'Model 3', year: 2023, type: 'ev', basePrice: [44000, 62000], engine: ['EV'], fuel: ['Electric'], drive: ['RWD', 'AWD'], trans: ['Automatic'] },
  { make: 'Tesla', model: 'Model Y', year: 2023, type: 'ev', basePrice: [50000, 74000], engine: ['EV'], fuel: ['Electric'], drive: ['AWD'], trans: ['Automatic'] },
  { make: 'Lexus', model: 'RX 350', year: 2021, type: 'luxury', basePrice: [56000, 82000], engine: ['3.5L'], fuel: ['Petrol', 'Hybrid'], drive: ['AWD'], trans: ['Automatic'] },
  { make: 'Jeep', model: 'Wrangler Rubicon', year: 2022, type: 'offroad', basePrice: [52000, 76000], engine: ['2.0L', '3.6L'], fuel: ['Petrol'], drive: ['4WD'], trans: ['Automatic', 'Manual'] },
  { make: 'Porsche', model: 'Cayenne', year: 2021, type: 'luxury', basePrice: [82000, 130000], engine: ['3.0L', '4.0L'], fuel: ['Petrol', 'Hybrid'], drive: ['AWD'], trans: ['Automatic'] },
];

const IMAGE_DIR_HINTS = {
  'Toyota Corolla': ['toyota corolla 2020'],
  'Toyota Camry': ['toyota camri'],
  'Toyota Hilux': ['toyota hilux'],
  'Honda Civic': ['honda civic'],
  'Honda CR-V': ['honda crv 2021'],
  'Nissan X-Trail': ['nissan xtrain 2020'],
  'Nissan Navara': ['nossan navara'],
  'Mazda CX-5': ['mazda cx5 2021'],
  'Mitsubishi Montero Sport': ['montero sport 2020'],
  'Suzuki Swift': ['suzuki swift 2021'],
  'Hyundai Tucson': ['hyundai tuxon 2022'],
  'Kia Sportage': ['kia sprotgae 2021'],
  'Ford Ranger': ['ford ranger 2023'],
  'Ford Mustang GT': ['ford mustang gt 2020'],
  'BMW 320i': ['bmw 320i'],
  'BMW X5': ['bmw x5 2022'],
  'Mercedes-Benz C200': ['benz c200 2021'],
  'Mercedes-Benz GLC 300': ['benz glc 300 2022'],
  'Audi A4': ['audi a4 2020'],
  'Audi Q5': ['audi q5 2021'],
  'Tesla Model 3': ['tesla model 3 2023'],
  'Tesla Model Y': ['tesla model y 2023'],
  'Lexus RX 350': ['lexus rx350 2021'],
  'Jeep Wrangler Rubicon': ['wrangler rubcon 2022'],
  'Porsche Cayenne': ['proshe cayenne 2021'],
};

const EXTERIOR_COLORS = ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 'Pearl White', 'Midnight Blue', 'Gunmetal', 'Bronze'];
const INTERIOR_COLORS = ['Black', 'Charcoal', 'Beige', 'Tan', 'Brown'];
const COUNTRIES = ['Japan', 'Singapore', 'Thailand', 'Malaysia', 'United Arab Emirates', 'United Kingdom'];
const VEHICLE_GRADES = ['A', 'B', 'C'];
const CONDITIONS = ['excellent', 'very good', 'good', 'fair'];
const PAYMENT_METHODS = ['bank_transfer', 'credit_card', 'escrow'];

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function randomInt(min, max) {
  return faker.number.int({ min, max });
}

function pick(arr) {
  return arr[faker.number.int({ min: 0, max: arr.length - 1 })];
}

function randomDateBetween(start, end) {
  return faker.date.between({ from: start, to: end });
}

function randomRecentDate(maxDaysAgo) {
  const now = new Date();
  const start = new Date(now.getTime() - maxDaysAgo * 24 * 60 * 60 * 1000);
  return randomDateBetween(start, now);
}

function startOfYear(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), 0, 1, 0, 0, 0));
}

function nearestFutureAug15(now) {
  const aug15 = new Date(Date.UTC(now.getUTCFullYear(), 7, 15, 23, 59, 59));
  if (now <= aug15) return aug15;
  return new Date(Date.UTC(now.getUTCFullYear() + 1, 7, 15, 23, 59, 59));
}

function toSlug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function normalizeFolderName(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function createVin() {
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let vin = '';
  for (let i = 0; i < 17; i++) vin += chars.charAt(randomInt(0, chars.length - 1));
  return vin;
}

function buildVehicleTitle(make, model, year, trim) {
  return `${year} ${make} ${model} ${trim}`;
}

function buildVehicleDescription(make, model, year, mileage, condition, fuel, transmission) {
  const lines = [
    `${year} ${make} ${model} in ${condition} condition with ${mileage.toLocaleString()} km.`,
    `Powertrain: ${fuel} engine paired with ${transmission} transmission.`,
    'Maintained on schedule with service records available and ready for immediate transfer.',
  ];
  return lines.join(' ');
}

function estimateStartingPrice(range) {
  const [min, max] = range;
  const base = faker.number.float({ min, max, fractionDigits: 0 });
  return Math.round(base / 100) * 100;
}

function estimateMarketValue(startingPrice, vehicleType) {
  const premium = vehicleType === 'luxury' || vehicleType === 'ev' || vehicleType === 'sports'
    ? faker.number.float({ min: 1.08, max: 1.22, fractionDigits: 2 })
    : faker.number.float({ min: 1.03, max: 1.15, fractionDigits: 2 });
  return Math.round((startingPrice * premium) / 100) * 100;
}

function chooseImagePool(make, model, dataMap) {
  const key = `${make} ${model}`;
  const hints = IMAGE_DIR_HINTS[key] || [];

  for (const hint of hints) {
    const normalized = normalizeFolderName(hint);
    if (dataMap.has(normalized)) return dataMap.get(normalized);
  }

  const fallback = [];
  for (const [dir, files] of dataMap.entries()) {
    if (dir.includes(make.toLowerCase()) || dir.includes(model.toLowerCase().replace(/[^a-z0-9]+/g, ' '))) {
      fallback.push(...files);
    }
  }
  return fallback;
}

function rotateImages(pool, desiredCount) {
  if (!pool.length) return ['/uploads/vehicles/placeholder_vehicle.jpg'];
  const imgs = [];
  const offset = randomInt(0, pool.length - 1);
  for (let i = 0; i < desiredCount; i++) {
    imgs.push(pool[(offset + i) % pool.length]);
  }
  return imgs;
}

function printDemoCredentials() {
  console.log('\nDemo login accounts');
  console.table([
    { role: 'admin', email: DEMO_ACCOUNTS.admins[0].email, password: DEMO_PASSWORD },
    { role: 'buyer', email: DEMO_ACCOUNTS.buyers[0].email, password: DEMO_PASSWORD },
    { role: 'seller demo', email: DEMO_ACCOUNTS.sellers[0].email, password: DEMO_PASSWORD },
  ]);
}

function loadDataImages() {
  const dataMap = new Map();

  if (!fs.existsSync(dataRoot)) {
    return dataMap;
  }

  const dirs = fs.readdirSync(dataRoot, { withFileTypes: true }).filter((d) => d.isDirectory());

  for (const dir of dirs) {
    const abs = path.join(dataRoot, dir.name);
    const files = fs.readdirSync(abs, { withFileTypes: true })
      .filter((f) => f.isFile())
      .map((f) => {
        const relative = path.relative(path.join(projectRoot, '..'), path.join(abs, f.name)).split(path.sep).join('/');
        return `/${relative}`;
      });

    dataMap.set(normalizeFolderName(dir.name), files);
  }

  return dataMap;
}

async function tableExists(pool, tableName) {
  const { rows } = await pool.query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS found`,
    [tableName]
  );
  return rows[0].found;
}

async function columnExists(pool, tableName, columnName) {
  const { rows } = await pool.query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
     ) AS found`,
    [tableName, columnName]
  );
  return rows[0].found;
}

async function clearDatabase(pool) {
  const statements = [
    'TRUNCATE TABLE notifications RESTART IDENTITY CASCADE',
    'TRUNCATE TABLE watchlists RESTART IDENTITY CASCADE',
    'TRUNCATE TABLE reviews RESTART IDENTITY CASCADE',
    'TRUNCATE TABLE payments RESTART IDENTITY CASCADE',
    'TRUNCATE TABLE bids RESTART IDENTITY CASCADE',
    'TRUNCATE TABLE auctions RESTART IDENTITY CASCADE',
    'TRUNCATE TABLE vehicles RESTART IDENTITY CASCADE',
    'TRUNCATE TABLE users RESTART IDENTITY CASCADE',
  ];

  for (const sql of statements) {
    try {
      await pool.query(sql);
    } catch {
      // Ignore missing optional tables and continue.
    }
  }
}

async function seedUsers(pool) {
  const now = new Date();
  const minCreated = new Date(now.getTime() - 240 * 24 * 60 * 60 * 1000);

  const hasPhone = await columnExists(pool, 'users', 'phone');
  const hasAddress = await columnExists(pool, 'users', 'address');
  const hasProfileImage = await columnExists(pool, 'users', 'profile_image');
  const hasLastLogin = await columnExists(pool, 'users', 'last_login');
  const hasIsActive = await columnExists(pool, 'users', 'is_active');

  const admins = [];
  const sellers = [];
  const buyers = [];

  for (let i = 0; i < ADMIN_COUNT; i++) {
    admins.push({ role: 'admin', kind: 'admin', fixed: DEMO_ACCOUNTS.admins[i] });
  }
  for (let i = 0; i < SELLER_COUNT; i++) {
    sellers.push({ role: 'buyer', kind: 'seller', fixed: DEMO_ACCOUNTS.sellers[i] });
  }
  for (let i = 0; i < BUYER_COUNT; i++) {
    buyers.push({ role: 'buyer', kind: 'buyer', fixed: DEMO_ACCOUNTS.buyers[i] });
  }

  const allUsers = [...admins, ...sellers, ...buyers];
  const inserted = [];

  for (let i = 0; i < allUsers.length; i++) {
    const profile = allUsers[i];
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = profile.fixed?.name || `${firstName} ${lastName}`;

    const emailTag = profile.kind === 'seller' ? 'seller' : profile.kind;
    const generatedEmail = `${toSlug(firstName)}.${toSlug(lastName)}.${emailTag}${String(i + 1).padStart(3, '0')}@auctionmail.com`;
    const email = profile.fixed?.email || generatedEmail;

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
    const createdAt = randomDateBetween(minCreated, now);
    const lastLogin = randomDateBetween(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now);
    const isActive = faker.datatype.boolean({ probability: 0.95 });

    const columns = ['email', 'password_hash', 'role', 'name', 'verification_status', 'created_at', 'must_change_password'];
    const values = [email, passwordHash, profile.role, fullName, 'verified', createdAt, false];

    if (hasPhone) {
      columns.push('phone');
      values.push(faker.phone.number('+## ###########'));
    }
    if (hasAddress) {
      columns.push('address');
      values.push(faker.location.streetAddress({ useFullAddress: true }));
    }
    if (hasProfileImage) {
      columns.push('profile_image');
      values.push(PROFILE_PLACEHOLDER);
    }
    if (hasLastLogin) {
      columns.push('last_login');
      values.push(lastLogin);
    }
    if (hasIsActive) {
      columns.push('is_active');
      values.push(isActive);
    }

    const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
    const sql = `INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders}) RETURNING id, role, name, email, created_at`;
    const { rows } = await pool.query(sql, values);
    inserted.push({ ...rows[0], kind: profile.kind });
  }

  return {
    admins: inserted.filter((u) => u.kind === 'admin'),
    sellers: inserted.filter((u) => u.kind === 'seller'),
    buyers: inserted.filter((u) => u.kind === 'buyer'),
    allUsers: inserted,
  };
}

async function seedVehicles(pool, sellers) {
  const imageMap = loadDataImages();

  const hasTransmission = await columnExists(pool, 'vehicles', 'transmission');
  const hasFuelType = await columnExists(pool, 'vehicles', 'fuel_type');
  const hasDrivetrain = await columnExists(pool, 'vehicles', 'drivetrain');
  const hasEngineCapacity = await columnExists(pool, 'vehicles', 'engine_capacity');
  const hasExteriorColor = await columnExists(pool, 'vehicles', 'exterior_color');
  const hasInteriorColor = await columnExists(pool, 'vehicles', 'interior_color');
  const hasVin = await columnExists(pool, 'vehicles', 'vin');
  const hasCondition = await columnExists(pool, 'vehicles', 'condition');
  const hasReservePrice = await columnExists(pool, 'vehicles', 'reserve_price');
  const hasMarketValue = await columnExists(pool, 'vehicles', 'estimated_market_value');
  const hasRegistrationCountry = await columnExists(pool, 'vehicles', 'registration_country');
  const hasViewCount = await columnExists(pool, 'vehicles', 'view_count');

  const vehicles = [];
  const now = new Date();
  const earliestCreated = new Date(now.getTime() - 240 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < VEHICLE_CATALOG.length; i++) {
    const cfg = VEHICLE_CATALOG[i];
    const seller = sellers[i % sellers.length];
    const year = cfg.year;

    const startingPrice = estimateStartingPrice(cfg.basePrice);
    const marketValue = estimateMarketValue(startingPrice, cfg.type);
    const reservePrice = faker.datatype.boolean({ probability: 0.55 })
      ? Math.round((startingPrice * faker.number.float({ min: 1.05, max: 1.28, fractionDigits: 2 })) / 100) * 100
      : null;

    const transmission = pick(cfg.trans);
    const fuel = pick(cfg.fuel);
    const drivetrain = pick(cfg.drive);
    const engine = pick(cfg.engine);
    const exterior = pick(EXTERIOR_COLORS);
    const interior = pick(INTERIOR_COLORS);
    const condition = pick(CONDITIONS);
    const mileage = clamp(
      randomInt(5000, 120000) - (year - 2016) * randomInt(1000, 6000),
      8000,
      145000
    );
    const trim = pick(['Base', 'Premium', 'Sport', 'Limited', 'Executive']);
    const title = buildVehicleTitle(cfg.make, cfg.model, year, trim);
    const description = buildVehicleDescription(cfg.make, cfg.model, year, mileage, condition, fuel, transmission);
    const grade = pick(VEHICLE_GRADES);
    const chassis = `CH-${toSlug(cfg.make).slice(0, 3).toUpperCase()}${toSlug(cfg.model).slice(0, 4).toUpperCase()}-${faker.string.alphanumeric({ length: 8, casing: 'upper' })}`;
    const createdAt = randomDateBetween(earliestCreated, now);
    const imagePool = chooseImagePool(cfg.make, cfg.model, imageMap);
    const images = rotateImages(imagePool, randomInt(3, 6));
    const vin = createVin();
    const country = pick(COUNTRIES);
    const viewCount = Math.floor(Math.abs(faker.number.int({ min: 15, max: 350 })) ** 1.15);

    const columns = [
      'seller_id', 'title', 'description', 'make', 'model', 'year',
      'starting_price', 'status', 'created_at', 'chassis_number', 'mileage', 'grade', 'images',
    ];
    const values = [
      seller.id, title, description, cfg.make, cfg.model, year,
      startingPrice, 'listed', createdAt, chassis, mileage, grade, images,
    ];

    if (hasTransmission) { columns.push('transmission'); values.push(transmission); }
    if (hasFuelType) { columns.push('fuel_type'); values.push(fuel); }
    if (hasDrivetrain) { columns.push('drivetrain'); values.push(drivetrain); }
    if (hasEngineCapacity) { columns.push('engine_capacity'); values.push(engine); }
    if (hasExteriorColor) { columns.push('exterior_color'); values.push(exterior); }
    if (hasInteriorColor) { columns.push('interior_color'); values.push(interior); }
    if (hasVin) { columns.push('vin'); values.push(vin); }
    if (hasCondition) { columns.push('condition'); values.push(condition); }
    if (hasReservePrice) { columns.push('reserve_price'); values.push(reservePrice); }
    if (hasMarketValue) { columns.push('estimated_market_value'); values.push(marketValue); }
    if (hasRegistrationCountry) { columns.push('registration_country'); values.push(country); }
    if (hasViewCount) { columns.push('view_count'); values.push(viewCount); }

    const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
    const { rows } = await pool.query(
      `INSERT INTO vehicles (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    vehicles.push(rows[0]);
  }

  return vehicles;
}

function distributeVehiclesForAuctions(vehicles) {
  const totalAuctions = AUCTION_COUNTS.completed + AUCTION_COUNTS.active + AUCTION_COUNTS.scheduled + AUCTION_COUNTS.draft;

  if (vehicles.length < totalAuctions) {
    throw new Error(`Not enough vehicles (${vehicles.length}) for ${totalAuctions} auctions.`);
  }

  return faker.helpers.shuffle(vehicles).slice(0, totalAuctions);
}

function buildAuctionTimeline(statusBucket, now) {
  const yearStart = startOfYear(now);
  const julyStart = new Date(Date.UTC(now.getUTCFullYear(), 6, 1, 0, 0, 0));
  const aug15 = nearestFutureAug15(now);

  if (statusBucket === 'completed') {
    const start = randomDateBetween(yearStart, new Date(Math.min(julyStart.getTime(), now.getTime() - 5 * 24 * 60 * 60 * 1000)));
    const end = randomDateBetween(new Date(start.getTime() + 8 * 60 * 60 * 1000), new Date(Math.min(now.getTime() - 60 * 60 * 1000, start.getTime() + 20 * 24 * 60 * 60 * 1000)));
    return { startsAt: start, endsAt: end, status: 'ended' };
  }

  if (statusBucket === 'active') {
    const start = randomDateBetween(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), new Date(now.getTime() - 2 * 60 * 60 * 1000));
    const end = randomDateBetween(new Date(now.getTime() + 6 * 60 * 60 * 1000), aug15);
    return { startsAt: start, endsAt: end, status: 'active' };
  }

  if (statusBucket === 'scheduled') {
    const start = randomDateBetween(new Date(now.getTime() + 24 * 60 * 60 * 1000), aug15);
    const end = randomDateBetween(new Date(start.getTime() + 8 * 60 * 60 * 1000), new Date(start.getTime() + 12 * 24 * 60 * 60 * 1000));
    return { startsAt: start, endsAt: end, status: 'draft' };
  }

  return { startsAt: null, endsAt: null, status: 'draft' };
}

function computeMinIncrement(startingPrice) {
  const pct = faker.number.float({ min: 0.005, max: 0.018, fractionDigits: 3 });
  return Math.max(50, Math.round((startingPrice * pct) / 50) * 50);
}

function generateBidSeries(startingPrice, minIncrement, bidCount) {
  const bids = [];
  let current = startingPrice;

  for (let i = 0; i < bidCount; i++) {
    const risePct = faker.number.float({ min: 0.01, max: 0.1, fractionDigits: 3 });
    const target = Math.round(current * (1 + risePct));
    const minAllowed = current + minIncrement;
    current = Math.max(target, minAllowed);
    current = Math.round(current / 50) * 50;
    bids.push(current);
  }

  return bids;
}

function pickBidderExcludingSeller(buyers, sellerId, previousBidderId) {
  const candidates = buyers.filter((b) => b.id !== sellerId && b.id !== previousBidderId);
  if (candidates.length) return pick(candidates);
  return pick(buyers.filter((b) => b.id !== sellerId));
}

async function seedAuctionsAndBids(pool, vehicles, buyers) {
  const now = new Date();
  const hasAuctionSeller = await columnExists(pool, 'auctions', 'seller_id');
  const hasAuctionStartingPrice = await columnExists(pool, 'auctions', 'starting_price');
  const hasAuctionCurrentHighest = await columnExists(pool, 'auctions', 'current_highest_bid');

  const buckets = [
    ...Array(AUCTION_COUNTS.completed).fill('completed'),
    ...Array(AUCTION_COUNTS.active).fill('active'),
    ...Array(AUCTION_COUNTS.scheduled).fill('scheduled'),
    ...Array(AUCTION_COUNTS.draft).fill('draft'),
  ];

  const selectedVehicles = distributeVehiclesForAuctions(vehicles);
  const auctions = [];
  const completedOutcomes = [];

  for (let i = 0; i < selectedVehicles.length; i++) {
    const vehicle = selectedVehicles[i];
    const bucket = buckets[i];
    const timeline = buildAuctionTimeline(bucket, now);

    const reservePrice = faker.datatype.boolean({ probability: 0.45 })
      ? Math.round((Number(vehicle.starting_price) * faker.number.float({ min: 1.06, max: 1.3, fractionDigits: 2 })) / 100) * 100
      : null;

    const minIncrement = computeMinIncrement(Number(vehicle.starting_price));

    const columns = ['vehicle_id', 'title', 'description', 'status', 'starts_at', 'ends_at', 'min_increment', 'reserve_price', 'created_at'];
    const values = [
      vehicle.id,
      `${vehicle.year} ${vehicle.make} ${vehicle.model} - ${bucket === 'completed' ? 'Closed' : bucket === 'active' ? 'Live' : bucket === 'scheduled' ? 'Upcoming' : 'Draft'} Auction`,
      `Auction listing for ${vehicle.make} ${vehicle.model}. ${bucket === 'scheduled' ? 'Scheduled for upcoming run.' : 'Open to qualified verified buyers.'}`,
      timeline.status,
      timeline.startsAt,
      timeline.endsAt,
      minIncrement,
      reservePrice,
      timeline.startsAt || randomRecentDate(120),
    ];

    if (hasAuctionSeller) {
      columns.push('seller_id');
      values.push(vehicle.seller_id);
    }
    if (hasAuctionStartingPrice) {
      columns.push('starting_price');
      values.push(Number(vehicle.starting_price));
    }
    if (hasAuctionCurrentHighest) {
      columns.push('current_highest_bid');
      values.push(null);
    }

    const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
    const { rows } = await pool.query(
      `INSERT INTO auctions (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    const auction = rows[0];
    auctions.push({ ...auction, bucket });

    if (bucket === 'scheduled' || bucket === 'draft') {
      continue;
    }

    const bidCount = bucket === 'completed' ? randomInt(5, 35) : randomInt(3, 20);
    const bidValues = generateBidSeries(Number(vehicle.starting_price), minIncrement, bidCount);

    let previousBidderId = null;
    const bidRows = [];

    for (let bidIndex = 0; bidIndex < bidValues.length; bidIndex++) {
      const bidder = pickBidderExcludingSeller(buyers, vehicle.seller_id, previousBidderId);
      previousBidderId = bidder.id;

      const from = timeline.startsAt || randomRecentDate(60);
      const to = timeline.endsAt && bucket === 'completed'
        ? timeline.endsAt
        : new Date(Math.min(now.getTime(), timeline.endsAt ? timeline.endsAt.getTime() : now.getTime()));

      const createdAt = randomDateBetween(from, to);
      const bidRes = await pool.query(
        `INSERT INTO bids (auction_id, user_id, amount, created_at)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [auction.id, bidder.id, bidValues[bidIndex], createdAt]
      );
      bidRows.push(bidRes.rows[0]);
    }

    bidRows.sort((a, b) => Number(a.amount) - Number(b.amount));
    const highestBid = bidRows[bidRows.length - 1];

    if (hasAuctionCurrentHighest) {
      await pool.query('UPDATE auctions SET current_highest_bid = $1 WHERE id = $2', [highestBid.amount, auction.id]);
    }

    if (bucket === 'completed') {
      await pool.query('UPDATE auctions SET winning_bid_id = $1 WHERE id = $2', [highestBid.id, auction.id]);
      completedOutcomes.push({
        auctionId: auction.id,
        sellerId: vehicle.seller_id,
        winnerId: highestBid.user_id,
        winningBidId: highestBid.id,
        amount: Number(highestBid.amount),
        endedAt: timeline.endsAt || now,
        startsAt: timeline.startsAt,
      });
    }
  }

  return { auctions, completedOutcomes };
}

async function seedPayments(pool, completedOutcomes) {
  const exists = await tableExists(pool, 'payments');
  if (!exists) return 0;

  let inserted = 0;

  for (const item of completedOutcomes) {
    const status = faker.helpers.weightedArrayElement([
      { weight: 0.78, value: 'paid' },
      { weight: 0.18, value: 'pending' },
      { weight: 0.04, value: 'refunded' },
    ]);

    const createdAt = randomDateBetween(item.endedAt, new Date());

    await pool.query(
      `INSERT INTO payments
       (auction_id, payer_id, payee_id, amount, status, payment_method, transaction_ref, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)`,
      [
        item.auctionId,
        item.winnerId,
        item.sellerId,
        item.amount,
        status,
        pick(PAYMENT_METHODS),
        `TX-${faker.string.alphanumeric({ length: 12, casing: 'upper' })}`,
        createdAt,
      ]
    );

    inserted += 1;
  }

  return inserted;
}

function generateReviewText(rating, make, model) {
  if (rating >= 5) {
    return `Excellent transaction. ${make} ${model} matched the listing and seller communication was top-notch.`;
  }
  if (rating === 4) {
    return `Smooth overall process. ${make} ${model} arrived as described with minor cosmetic differences only.`;
  }
  if (rating === 3) {
    return `Decent buying experience. ${make} ${model} was acceptable, though paperwork took a bit longer than expected.`;
  }
  return `Acceptable outcome for the ${make} ${model}. Some delays in handover but issue was resolved.`;
}

async function seedReviews(pool, completedOutcomes, vehicleByAuctionId) {
  const exists = await tableExists(pool, 'reviews');
  if (!exists) return 0;

  let inserted = 0;

  for (const item of completedOutcomes) {
    if (!faker.datatype.boolean({ probability: 0.72 })) continue;

    const rating = faker.helpers.weightedArrayElement([
      { weight: 0.5, value: 5 },
      { weight: 0.33, value: 4 },
      { weight: 0.14, value: 3 },
      { weight: 0.03, value: 2 },
    ]);

    const vehicle = vehicleByAuctionId.get(item.auctionId);
    const reviewDate = randomDateBetween(item.endedAt, new Date());

    await pool.query(
      `INSERT INTO reviews (auction_id, seller_id, reviewer_id, rating, review_text, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        item.auctionId,
        item.sellerId,
        item.winnerId,
        rating,
        generateReviewText(rating, vehicle?.make || 'vehicle', vehicle?.model || 'listing'),
        reviewDate,
      ]
    );

    inserted += 1;
  }

  return inserted;
}

async function seedWatchlists(pool, buyers, vehicles) {
  const exists = await tableExists(pool, 'watchlists');
  if (!exists) return 0;

  let inserted = 0;

  for (const buyer of buyers) {
    const watchCount = randomInt(5, 20);
    const selected = faker.helpers.arrayElements(vehicles, watchCount);

    for (const vehicle of selected) {
      await pool.query(
        `INSERT INTO watchlists (user_id, vehicle_id, created_at)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, vehicle_id) DO NOTHING`,
        [buyer.id, vehicle.id, randomRecentDate(120)]
      );
      inserted += 1;
    }
  }

  return inserted;
}

async function seedNotifications(pool, users, completedOutcomes, activeAuctions) {
  const exists = await tableExists(pool, 'notifications');
  if (!exists) return 0;

  let inserted = 0;

  const activeSubset = faker.helpers.arrayElements(activeAuctions, Math.min(activeAuctions.length, 20));

  for (const auction of activeSubset) {
    const audience = faker.helpers.arrayElements(users, randomInt(3, 10));
    for (const user of audience) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, payload, read_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          user.id,
          'auction_ending_soon',
          'Auction ending soon',
          `${auction.title} is closing soon. Place your best offer now.`,
          JSON.stringify({ auctionId: auction.id }),
          faker.datatype.boolean({ probability: 0.45 }) ? randomRecentDate(12) : null,
          randomRecentDate(12),
        ]
      );
      inserted += 1;
    }
  }

  const completedSample = faker.helpers.arrayElements(completedOutcomes, Math.min(completedOutcomes.length, 35));
  for (const item of completedSample) {
    const won = faker.datatype.boolean({ probability: 0.5 });
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, payload, read_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        item.winnerId,
        won ? 'auction_won' : 'auction_lost',
        won ? 'You won the auction' : 'Auction result update',
        won
          ? `Congratulations. You won auction #${item.auctionId}.`
          : `Auction #${item.auctionId} has ended.`,
        JSON.stringify({ auctionId: item.auctionId, amount: item.amount }),
        faker.datatype.boolean({ probability: 0.35 }) ? randomRecentDate(20) : null,
        randomRecentDate(20),
      ]
    );
    inserted += 1;

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, payload, read_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        item.sellerId,
        'payment_received',
        'Payment activity',
        `Auction #${item.auctionId} payment status updated.`,
        JSON.stringify({ auctionId: item.auctionId }),
        faker.datatype.boolean({ probability: 0.5 }) ? randomRecentDate(20) : null,
        randomRecentDate(20),
      ]
    );
    inserted += 1;
  }

  return inserted;
}

async function main() {
  if (!connectionString) {
    throw new Error('DATABASE_URL (or DATABASE_PUBLIC_URL) is required.');
  }

  faker.seed(Date.now());

  const pool = new pg.Pool({ connectionString });
  const shouldClear = !process.argv.includes('--no-clear');

  try {
    if (shouldClear) {
      console.log('Clearing existing rows...');
      await clearDatabase(pool);
    }

    console.log('Seeding users...');
    const users = await seedUsers(pool);

    console.log('Seeding vehicles...');
    const vehicles = await seedVehicles(pool, users.sellers);

    console.log('Seeding auctions and bids...');
    const { auctions, completedOutcomes } = await seedAuctionsAndBids(pool, vehicles, [...users.buyers, ...users.sellers]);

    const vehicleByAuctionId = new Map();
    const auctionVehicle = await pool.query('SELECT id, vehicle_id FROM auctions');
    if (auctionVehicle.rows.length) {
      const ids = auctionVehicle.rows.map((r) => r.vehicle_id);
      const vehiclesRes = await pool.query('SELECT id, make, model FROM vehicles WHERE id = ANY($1::int[])', [ids]);
      const vehicleMap = new Map(vehiclesRes.rows.map((r) => [r.id, r]));
      for (const row of auctionVehicle.rows) {
        vehicleByAuctionId.set(row.id, vehicleMap.get(row.vehicle_id));
      }
    }

    console.log('Seeding payments, reviews, watchlists, and notifications...');
    const paymentCount = await seedPayments(pool, completedOutcomes);
    const reviewCount = await seedReviews(pool, completedOutcomes, vehicleByAuctionId);
    const watchlistCount = await seedWatchlists(pool, users.buyers, vehicles);
    const activeAuctions = auctions.filter((a) => a.status === 'active');
    const notificationCount = await seedNotifications(pool, users.allUsers, completedOutcomes, activeAuctions);

    console.log('Seed complete.');
    console.table({
      users_total: users.allUsers.length,
      buyers: users.buyers.length,
      sellers: users.sellers.length,
      admins: users.admins.length,
      vehicles: vehicles.length,
      auctions_completed: auctions.filter((a) => a.bucket === 'completed').length,
      auctions_active: auctions.filter((a) => a.bucket === 'active').length,
      auctions_scheduled: auctions.filter((a) => a.bucket === 'scheduled').length,
      auctions_draft: auctions.filter((a) => a.bucket === 'draft').length,
      bids: (await pool.query('SELECT COUNT(*)::int AS count FROM bids')).rows[0].count,
      payments: paymentCount,
      reviews: reviewCount,
      watchlists: watchlistCount,
      notifications: notificationCount,
    });
    printDemoCredentials();
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
