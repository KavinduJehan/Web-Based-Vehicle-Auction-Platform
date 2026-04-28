import { pool } from '../db/pool.js';

const SORT_COLS = {
  created_at:    'created_at',
  starting_price: 'starting_price',
  year:          'year',
  title:         'title',
};

export async function findAll({ status, make, model, yearMin, yearMax, priceMin, priceMax, search, page, limit, sortBy, order } = {}) {
  const col = SORT_COLS[sortBy] ?? 'created_at';
  const dir = order === 'asc' ? 'ASC' : 'DESC';

  const conditions = [];
  const params = [];
  let i = 1;

  if (status)              { conditions.push(`status = $${i++}`);             params.push(status); }
  if (make)                { conditions.push(`make ILIKE $${i++}`);            params.push(`%${make}%`); }
  if (model)               { conditions.push(`model ILIKE $${i++}`);           params.push(`%${model}%`); }
  if (yearMin != null)     { conditions.push(`year >= $${i++}`);               params.push(yearMin); }
  if (yearMax != null)     { conditions.push(`year <= $${i++}`);               params.push(yearMax); }
  if (priceMin != null)    { conditions.push(`starting_price >= $${i++}`);     params.push(priceMin); }
  if (priceMax != null)    { conditions.push(`starting_price <= $${i++}`);     params.push(priceMax); }
  if (search) {
    conditions.push(`(title ILIKE $${i} OR make ILIKE $${i} OR model ILIKE $${i} OR description ILIKE $${i})`);
    params.push(`%${search}%`);
    i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await pool.query(`SELECT COUNT(*) FROM vehicles ${where}`, params);
  const total = parseInt(countRes.rows[0].count, 10);

  const resolvedPage  = page  ?? 1;
  const resolvedLimit = limit ?? 20;
  const offset = (resolvedPage - 1) * resolvedLimit;

  const dataRes = await pool.query(
    `SELECT * FROM vehicles ${where} ORDER BY ${col} ${dir} LIMIT $${i++} OFFSET $${i++}`,
    [...params, resolvedLimit, offset]
  );

  return { rows: dataRes.rows, total, page: resolvedPage, limit: resolvedLimit };
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT * FROM vehicles WHERE id = $1 LIMIT 1', [id]);
  return rows[0];
}

export async function create(payload) {
  const { rows } = await pool.query(
    `INSERT INTO vehicles (title, description, starting_price, make, model, year, status, seller_id,
                           chassis_number, mileage, grade, images)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      payload.title,
      payload.description,
      payload.startingPrice,
      payload.make,
      payload.model,
      payload.year,
      payload.status,
      payload.sellerId,
      payload.chassisNumber ?? null,
      payload.mileage       ?? null,
      payload.grade         ?? null,
      payload.images        ?? [],
    ]
  );
  return rows[0];
}

export async function update(id, payload) {
  const { rows } = await pool.query(
    `UPDATE vehicles
     SET title = $1, description = $2, starting_price = $3, make = $4, model = $5, year = $6,
         status = $7, chassis_number = $8, mileage = $9, grade = $10, images = $11
     WHERE id = $12
     RETURNING *`,
    [
      payload.title,
      payload.description,
      payload.startingPrice,
      payload.make,
      payload.model,
      payload.year,
      payload.status,
      payload.chassisNumber ?? null,
      payload.mileage       ?? null,
      payload.grade         ?? null,
      payload.images        ?? [],
      id,
    ]
  );
  return rows[0];
}

export async function remove(id) {
  const { rowCount } = await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
  return rowCount > 0;
}
