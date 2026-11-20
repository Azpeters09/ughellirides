/**
 * SQLite storage adapter for UghelliRides (dev / pre-migration fallback).
 * Mirrors the Supabase adapter's interface so server.js is backend-agnostic.
 */
const Database = require('better-sqlite3');

let db;

function init(dbPath) {
  require('fs').mkdirSync(require('path').dirname(dbPath), { recursive: true });
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      make_model TEXT NOT NULL,
      year INTEGER,
      color TEXT,
      seats TEXT,
      category TEXT,
      transmission TEXT,
      plate_number TEXT NOT NULL,
      availability TEXT,
      license_valid_until TEXT,
      insurance_valid_until TEXT,
      roadworthiness_until TEXT,
      payout_method TEXT,
      account_details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      dob TEXT,
      gender TEXT,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      experience TEXT,
      license_class TEXT,
      license_expiry TEXT,
      nin_available TEXT,
      transmission_types TEXT,
      areas_known TEXT,
      availability TEXT,
      payout_method TEXT,
      account_details TEXT,
      owns_vehicle TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      pickup TEXT NOT NULL,
      destination TEXT NOT NULL,
      pickup_time TEXT,
      service_type TEXT,
      car_preference TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'new'
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review_type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      booking_reference TEXT,
      contact_method TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

const VEHICLE_COLS = ['owner_name','phone','email','city','address','make_model','year','color',
  'seats','category','transmission','plate_number','availability','license_valid_until',
  'insurance_valid_until','roadworthiness_until','payout_method','account_details'];
const DRIVER_COLS = ['full_name','phone','dob','gender','city','address','experience',
  'license_class','license_expiry','nin_available','transmission_types','areas_known',
  'availability','payout_method','account_details','owns_vehicle'];
const BOOKING_COLS = ['customer_name','phone','pickup','destination','pickup_time',
  'service_type','car_preference','notes'];

const REVIEW_COLS = [
  'name', 'email', 'phone', 'rating', 'review_type', 'title', 'message',
  'booking_reference', 'contact_method', 'status'
];

function _insert(table, cols, data) {
  const placeholders = cols.map(c => '@' + c).join(', ');
  const stmt = db.prepare(`INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`);
  const info = stmt.run(data);
  return info.lastInsertRowid;
}

async function insertVehicle(data) { return _insert('vehicles', VEHICLE_COLS, data); }
async function insertDriver(data)  { return _insert('drivers', DRIVER_COLS, data); }
async function insertBooking(data) { return _insert('bookings', BOOKING_COLS, data); }

async function insertReview(data) {
  return _insert('reviews', REVIEW_COLS, data);
}

async function listTable(table) {
  return db.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 500`).all();
}

async function setStatus(table, id, status) {
  db.prepare(`UPDATE ${table} SET status=? WHERE id=?`).run(status, id);
}

module.exports = { init, insertVehicle, insertDriver, insertBooking, insertReview, listTable, setStatus };
