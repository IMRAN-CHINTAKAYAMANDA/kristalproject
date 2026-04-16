const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'assets.sqlite');
const sessions = new Map();
let db;

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

const saveDb = () => {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
};

const mapRows = (result) => {
  if (!result.length) return [];
  const [{ columns, values }] = result;
  return values.map((valueRow) =>
    Object.fromEntries(columns.map((column, index) => [column, valueRow[index]]))
  );
};

const run = async (sql, params = []) => {
  db.run(sql, params);
  const idRow = await get('SELECT last_insert_rowid() AS id');
  saveDb();
  return { id: idRow?.id || 0, changes: db.getRowsModified() };
};

const all = async (sql, params = []) => mapRows(db.exec(sql, params));

const get = (sql, params = []) => all(sql, params).then((rows) => rows[0]);

const hashPassword = (password) =>
  crypto.createHash('sha256').update(`kristalball:${password}`).digest('hex');

const createToken = () => crypto.randomBytes(32).toString('hex');

const toCamelUser = (user) => ({
  id: String(user.id),
  username: user.username,
  fullName: user.full_name,
  role: user.role,
  baseId: user.base_id || undefined,
  baseName: user.base_name || undefined,
});

const normalizeFilters = (query, user) => {
  const dateRange = Number(query.dateRange || 30);
  const since = new Date();
  since.setDate(since.getDate() - (Number.isFinite(dateRange) ? dateRange : 30));

  const requestedBase = query.base || 'all';
  const base =
    user.role === 'Admin'
      ? requestedBase
      : user.base_id || requestedBase;

  return {
    since: since.toISOString().slice(0, 10),
    base,
    equipmentType: query.equipmentType || 'all',
  };
};

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
};

const baseWhere = (column, filters, params) => {
  if (filters.base && filters.base !== 'all') {
    params.push(filters.base);
    return ` AND ${column} = ?`;
  }
  return '';
};

const typeWhere = (column, filters, params) => {
  if (filters.equipmentType && filters.equipmentType !== 'all') {
    params.push(filters.equipmentType);
    return ` AND ${column} = ?`;
  }
  return '';
};

async function initDb() {
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(__dirname, 'node_modules', 'sql.js', 'dist', file),
  });

  if (fs.existsSync(DB_PATH) && fs.statSync(DB_PATH).size > 0) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  await run('PRAGMA foreign_keys = ON');

  await run(`CREATE TABLE IF NOT EXISTS bases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS equipment_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Admin', 'Base Commander', 'Logistics Officer')),
    base_id TEXT,
    base_name TEXT,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    last_login TEXT,
    FOREIGN KEY(base_id) REFERENCES bases(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_type TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost REAL NOT NULL,
    total_cost REAL NOT NULL,
    supplier TEXT NOT NULL,
    receiving_base TEXT NOT NULL,
    purchase_order_number TEXT,
    date TEXT NOT NULL,
    notes TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_type TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    source_base TEXT NOT NULL,
    destination_base TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    initiated_by TEXT NOT NULL,
    date TEXT NOT NULL,
    reason TEXT NOT NULL,
    notes TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_type TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    asset_id TEXT NOT NULL,
    assigned_to TEXT NOT NULL,
    base TEXT NOT NULL,
    purpose TEXT NOT NULL,
    assignment_date TEXT NOT NULL,
    expected_return_date TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    notes TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS expenditures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_type TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    base TEXT NOT NULL,
    reason TEXT NOT NULL,
    date TEXT NOT NULL,
    reported_by TEXT NOT NULL,
    notes TEXT
  )`);

  const seedCount = await get('SELECT COUNT(*) AS count FROM bases');
  if (seedCount.count > 0) return;

  const bases = [
    ['base1', 'Fort Henderson', 'Texas'],
    ['base2', 'Camp Liberty', 'Georgia'],
    ['base3', 'Naval Air Station', 'California'],
    ['base4', 'Mountain View Base', 'Colorado'],
  ];
  for (const base of bases) await run('INSERT INTO bases VALUES (?, ?, ?)', base);

  const equipmentTypes = [
    ['vehicles', 'Vehicles', 'Ground'],
    ['small-arms', 'Small Arms', 'Weapons'],
    ['ammunition', 'Ammunition', 'Consumable'],
    ['heavy-weapons', 'Heavy Weapons', 'Weapons'],
    ['communication', 'Communication Equipment', 'Electronics'],
    ['medical', 'Medical Supplies', 'Consumable'],
  ];
  for (const type of equipmentTypes) await run('INSERT INTO equipment_types VALUES (?, ?, ?)', type);

  const users = [
    ['admin', 'System Administrator', 'Admin', null, null, 'admin@kristalball.local'],
    ['commander', 'Colonel Sarah Mitchell', 'Base Commander', 'base1', 'Fort Henderson', 'commander@kristalball.local'],
    ['logistics', 'Major James Rodriguez', 'Logistics Officer', 'base1', 'Fort Henderson', 'logistics@kristalball.local'],
  ];
  for (const user of users) {
    await run(
      `INSERT INTO users (username, password_hash, full_name, role, base_id, base_name, email)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user[0], hashPassword('password'), user[1], user[2], user[3], user[4], user[5]]
    );
  }

  const purchases = [
    ['Small Arms', 'M4A1 Carbine', 50, 1500, 75000, 'Colt Defense LLC', 'Fort Henderson', 'PO-2026-001', daysAgo(6), 'Standard issue rifles for infantry units'],
    ['Ammunition', '5.56mm NATO Ball', 10000, 2.5, 25000, 'Federal Premium', 'Fort Henderson', 'PO-2026-002', daysAgo(8), 'Training and operational ammunition'],
    ['Vehicles', 'HMMWV M1151', 3, 180000, 540000, 'AM General', 'Camp Liberty', 'PO-2026-003', daysAgo(11), 'Up-armored utility vehicles'],
  ];
  for (const purchase of purchases) {
    await run(
      `INSERT INTO purchases
       (equipment_type, asset_name, quantity, unit_cost, total_cost, supplier, receiving_base, purchase_order_number, date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      purchase
    );
  }

  const transfers = [
    ['Small Arms', 'M4A1 Rifles', 25, 'Fort Henderson', 'Camp Liberty', 'Completed', 'Major Rodriguez', daysAgo(3), 'Unit deployment support', ''],
    ['Vehicles', 'Humvees', 2, 'Mountain View Base', 'Fort Henderson', 'In Transit', 'Captain Williams', daysAgo(5), 'Maintenance rotation', ''],
    ['Communication Equipment', 'Tactical Radios', 12, 'Naval Air Station', 'Camp Liberty', 'Pending', 'Lt. Commander Davis', daysAgo(2), 'Exercise preparation', ''],
  ];
  for (const transfer of transfers) {
    await run(
      `INSERT INTO transfers
       (equipment_type, asset_name, quantity, source_base, destination_base, status, initiated_by, date, reason, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      transfer
    );
  }

  const assignments = [
    ['Small Arms', 'M4A1 Carbine', 'SA-2026-001', 'Sergeant Johnson', 'Fort Henderson', 'Standard issue for patrol duty', daysAgo(6), daysAgo(-150), 'Active', ''],
    ['Communication Equipment', 'PRC-152 Radio', 'CE-2026-045', 'Corporal Martinez', 'Camp Liberty', 'Communications for training exercise', daysAgo(4), daysAgo(15), 'Active', ''],
    ['Vehicles', 'HMMWV', 'VH-2026-012', 'Staff Sergeant Brown', 'Naval Air Station', 'Base security patrol', daysAgo(9), daysAgo(90), 'Active', ''],
  ];
  for (const assignment of assignments) {
    await run(
      `INSERT INTO assignments
       (equipment_type, asset_name, asset_id, assigned_to, base, purpose, assignment_date, expected_return_date, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      assignment
    );
  }

  const expenditures = [
    ['Ammunition', '5.56mm NATO', 500, 'Fort Henderson', 'Training', daysAgo(1), 'Sergeant Wilson', ''],
    ['Medical Supplies', 'First Aid Kits', 12, 'Camp Liberty', 'Training Exercise', daysAgo(7), 'Medic Thompson', ''],
    ['Ammunition', '9mm Parabellum', 200, 'Naval Air Station', 'Qualification Training', daysAgo(10), 'Petty Officer Lee', ''],
  ];
  for (const expenditure of expenditures) {
    await run(
      `INSERT INTO expenditures
       (equipment_type, asset_name, quantity, base, reason, date, reported_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      expenditure
    );
  }
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const user = sessions.get(token);

  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  req.user = user;
  next();
}

const requireRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    res.status(403).json({ error: 'Insufficient permissions' });
    return;
  }
  next();
};

const asyncRoute = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'military-asset-management-api' });
});

app.post('/api/login', asyncRoute(async (req, res) => {
  const { username, password } = req.body;
  const user = await get('SELECT * FROM users WHERE username = ?', [username]);

  if (!user || user.password_hash !== hashPassword(password || '')) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  await run('UPDATE users SET last_login = ? WHERE id = ?', [new Date().toISOString(), user.id]);
  const token = createToken();
  sessions.set(token, user);
  res.json({ token, user: toCamelUser(user) });
}));

app.post('/api/logout', auth, (req, res) => {
  const token = req.headers.authorization.slice(7);
  sessions.delete(token);
  res.json({ ok: true });
});

app.get('/api/me', auth, (req, res) => {
  res.json({ user: toCamelUser(req.user) });
});

app.get('/api/meta', auth, asyncRoute(async (_req, res) => {
  const bases = await all('SELECT id, name, location FROM bases ORDER BY name');
  const equipmentTypes = await all('SELECT id, name, category FROM equipment_types ORDER BY name');
  res.json({ bases, equipmentTypes });
}));

app.get('/api/dashboard', auth, asyncRoute(async (req, res) => {
  const filters = normalizeFilters(req.query, req.user);
  const purchaseParams = [filters.since];
  let purchaseWhere = 'WHERE date >= ?';
  purchaseWhere += baseWhere('receiving_base', filters, purchaseParams);
  purchaseWhere += typeWhere('equipment_type', filters, purchaseParams);

  const transferInParams = [filters.since];
  let transferInWhere = 'WHERE date >= ?';
  transferInWhere += baseWhere('destination_base', filters, transferInParams);
  transferInWhere += typeWhere('equipment_type', filters, transferInParams);

  const transferOutParams = [filters.since];
  let transferOutWhere = 'WHERE date >= ?';
  transferOutWhere += baseWhere('source_base', filters, transferOutParams);
  transferOutWhere += typeWhere('equipment_type', filters, transferOutParams);

  const assignedParams = [];
  let assignedWhere = "WHERE status = 'Active'";
  assignedWhere += baseWhere('base', filters, assignedParams);
  assignedWhere += typeWhere('equipment_type', filters, assignedParams);

  const expenditureParams = [filters.since];
  let expenditureWhere = 'WHERE date >= ?';
  expenditureWhere += baseWhere('base', filters, expenditureParams);
  expenditureWhere += typeWhere('equipment_type', filters, expenditureParams);

  const [purchaseTotals, transferInTotals, transferOutTotals, assignmentTotals, expenditureTotals] =
    await Promise.all([
      get(`SELECT COALESCE(SUM(quantity), 0) AS quantity FROM purchases ${purchaseWhere}`, purchaseParams),
      get(`SELECT COALESCE(SUM(quantity), 0) AS quantity FROM transfers ${transferInWhere}`, transferInParams),
      get(`SELECT COALESCE(SUM(quantity), 0) AS quantity FROM transfers ${transferOutWhere}`, transferOutParams),
      get(`SELECT COUNT(*) AS quantity FROM assignments ${assignedWhere}`, assignedParams),
      get(`SELECT COALESCE(SUM(quantity), 0) AS quantity FROM expenditures ${expenditureWhere}`, expenditureParams),
    ]);

  const netMovement = purchaseTotals.quantity + transferInTotals.quantity - transferOutTotals.quantity;
  const closingBalance = Math.max(0, netMovement - expenditureTotals.quantity + 15000);
  const openingBalance = Math.max(0, closingBalance - netMovement);

  const recentTransfers = await all(
    `SELECT asset_name AS asset, source_base AS "from", destination_base AS "to", quantity, date
     FROM transfers
     ORDER BY date DESC, id DESC
     LIMIT 5`
  );

  const assetStatus = await all(
    `SELECT receiving_base AS base,
            CAST(SUM(quantity) * 0.88 AS INTEGER) AS operational,
            SUM(quantity) AS total
     FROM purchases
     GROUP BY receiving_base
     ORDER BY receiving_base`
  );

  const [purchases, transfersIn, transfersOut] = await Promise.all([
    all(
      `SELECT id, asset_name AS asset, quantity, date, total_cost AS cost
       FROM purchases ${purchaseWhere}
       ORDER BY date DESC`,
      purchaseParams
    ),
    all(
      `SELECT id, asset_name AS asset, quantity, date, source_base AS source
       FROM transfers ${transferInWhere}
       ORDER BY date DESC`,
      transferInParams
    ),
    all(
      `SELECT id, asset_name AS asset, quantity, date, destination_base AS destination
       FROM transfers ${transferOutWhere}
       ORDER BY date DESC`,
      transferOutParams
    ),
  ]);

  res.json({
    openingBalance,
    closingBalance,
    netMovement,
    assignedAssets: assignmentTotals.quantity,
    expendedAssets: expenditureTotals.quantity,
    recentTransfers,
    assetStatus,
    netMovementDetails: { purchases, transfersIn, transfersOut },
  });
}));

app.get('/api/purchases', auth, asyncRoute(async (req, res) => {
  const params = [];
  let where = 'WHERE 1 = 1';
  if (req.user.role !== 'Admin' && req.user.base_name) {
    where += ' AND receiving_base = ?';
    params.push(req.user.base_name);
  }
  const rows = await all(
    `SELECT id, equipment_type AS equipmentType, asset_name AS assetName, quantity,
            unit_cost AS unitCost, total_cost AS totalCost, supplier,
            receiving_base AS receivingBase, purchase_order_number AS purchaseOrderNumber,
            date, notes
     FROM purchases ${where}
     ORDER BY date DESC, id DESC`,
    params
  );
  res.json(rows);
}));

app.post('/api/purchases', auth, requireRoles('Admin', 'Logistics Officer'), asyncRoute(async (req, res) => {
  const body = req.body;
  const quantity = Number(body.quantity);
  const unitCost = Number(body.unitCost);
  const totalCost = quantity * unitCost;
  const receivingBase = req.user.role === 'Admin' ? body.receivingBase : req.user.base_name;

  const result = await run(
    `INSERT INTO purchases
     (equipment_type, asset_name, quantity, unit_cost, total_cost, supplier, receiving_base, purchase_order_number, date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      body.equipmentType,
      body.assetName,
      quantity,
      unitCost,
      totalCost,
      body.supplier,
      receivingBase,
      body.purchaseOrderNumber || '',
      body.date || new Date().toISOString().slice(0, 10),
      body.notes || '',
    ]
  );
  res.status(201).json({ id: result.id });
}));

app.get('/api/transfers', auth, asyncRoute(async (req, res) => {
  const params = [];
  let where = 'WHERE 1 = 1';
  if (req.user.role !== 'Admin' && req.user.base_name) {
    where += ' AND (source_base = ? OR destination_base = ?)';
    params.push(req.user.base_name, req.user.base_name);
  }
  const rows = await all(
    `SELECT id, equipment_type AS equipmentType, asset_name AS assetName, quantity,
            source_base AS sourceBase, destination_base AS destinationBase, status,
            initiated_by AS initiatedBy, date, reason, notes
     FROM transfers ${where}
     ORDER BY date DESC, id DESC`,
    params
  );
  res.json(rows);
}));

app.post('/api/transfers', auth, requireRoles('Admin', 'Base Commander', 'Logistics Officer'), asyncRoute(async (req, res) => {
  const body = req.body;
  const result = await run(
    `INSERT INTO transfers
     (equipment_type, asset_name, quantity, source_base, destination_base, status, initiated_by, date, reason, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      body.equipmentType,
      body.assetName,
      Number(body.quantity),
      body.sourceBase,
      body.destinationBase,
      body.status || 'Pending',
      req.user.full_name,
      body.date || new Date().toISOString().slice(0, 10),
      body.reason,
      body.notes || '',
    ]
  );
  res.status(201).json({ id: result.id });
}));

app.get('/api/assignments', auth, asyncRoute(async (req, res) => {
  const params = [];
  let where = 'WHERE 1 = 1';
  if (req.user.role !== 'Admin' && req.user.base_name) {
    where += ' AND base = ?';
    params.push(req.user.base_name);
  }
  const rows = await all(
    `SELECT id, equipment_type AS equipmentType, asset_name AS assetName, asset_id AS assetId,
            assigned_to AS assignedTo, base, purpose, assignment_date AS assignmentDate,
            expected_return_date AS expectedReturnDate, status, notes
     FROM assignments ${where}
     ORDER BY assignment_date DESC, id DESC`,
    params
  );
  res.json(rows);
}));

app.post('/api/assignments', auth, requireRoles('Admin', 'Base Commander', 'Logistics Officer'), asyncRoute(async (req, res) => {
  const body = req.body;
  const result = await run(
    `INSERT INTO assignments
     (equipment_type, asset_name, asset_id, assigned_to, base, purpose, assignment_date, expected_return_date, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      body.equipmentType,
      body.assetName,
      body.assetId,
      body.assignedTo,
      body.base,
      body.purpose,
      body.assignmentDate || new Date().toISOString().slice(0, 10),
      body.expectedReturnDate || '',
      body.status || 'Active',
      body.notes || '',
    ]
  );
  res.status(201).json({ id: result.id });
}));

app.get('/api/expenditures', auth, asyncRoute(async (req, res) => {
  const params = [];
  let where = 'WHERE 1 = 1';
  if (req.user.role !== 'Admin' && req.user.base_name) {
    where += ' AND base = ?';
    params.push(req.user.base_name);
  }
  const rows = await all(
    `SELECT id, equipment_type AS equipmentType, asset_name AS assetName, quantity,
            base, reason, date, reported_by AS reportedBy, notes
     FROM expenditures ${where}
     ORDER BY date DESC, id DESC`,
    params
  );
  res.json(rows);
}));

app.post('/api/expenditures', auth, requireRoles('Admin', 'Base Commander', 'Logistics Officer'), asyncRoute(async (req, res) => {
  const body = req.body;
  const result = await run(
    `INSERT INTO expenditures
     (equipment_type, asset_name, quantity, base, reason, date, reported_by, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      body.equipmentType,
      body.assetName,
      Number(body.quantity),
      body.base,
      body.reason,
      body.date || new Date().toISOString().slice(0, 10),
      body.reportedBy || req.user.full_name,
      body.notes || '',
    ]
  );
  res.status(201).json({ id: result.id });
}));

app.get('/api/users', auth, requireRoles('Admin'), asyncRoute(async (_req, res) => {
  const users = await all(
    `SELECT id, username, full_name AS fullName, role, base_id AS baseId,
            base_name AS baseName, email, status, last_login AS lastLogin
     FROM users
     ORDER BY full_name`
  );
  res.json(users.map((user) => ({ ...user, id: String(user.id) })));
}));

app.post('/api/users', auth, requireRoles('Admin'), asyncRoute(async (req, res) => {
  const body = req.body;
  const base = body.baseId ? await get('SELECT * FROM bases WHERE id = ?', [body.baseId]) : null;
  const result = await run(
    `INSERT INTO users (username, password_hash, full_name, role, base_id, base_name, email)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      body.username,
      hashPassword(body.password),
      body.fullName,
      body.role,
      base?.id || null,
      base?.name || null,
      body.email || '',
    ]
  );
  res.status(201).json({ id: result.id });
}));

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Unexpected server error' });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
