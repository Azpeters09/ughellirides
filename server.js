#!/usr/bin/env node

/**

 * UghelliRides Backend API

 * - Primary storage: Supabase (PostgreSQL) when SUPABASE_URL + key are set

 * - Fallback: local SQLite (better-sqlite3) for dev / pre-migration

 * - Rate-limited, validated endpoints

 * - Admin dashboard protected by token auth

 */

const express = require('express');

const crypto = require('crypto');

const nodemailer = require('nodemailer');

const path = require('path');

const fs = require('fs');



// Load .env (keys & settings). Real env vars take precedence over .env values.

require('dotenv').config();



const EMAIL_TO = process.env.FEEDBACK_EMAIL || 'feedback@ughellirides.online';

const EMAIL_FROM = process.env.SMTP_FROM || 'noreply@ughellirides.online';

const SMTP_HOST = process.env.SMTP_HOST;

const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');

const SMTP_USER = process.env.SMTP_USER;

const SMTP_PASS = process.env.SMTP_PASS;





const app = express();

const PORT = process.env.PORT || 8787;

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'ughelli-admin-' + crypto.randomBytes(12).toString('hex');



// ─── Storage backend selection ──────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL || '';

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);



let store; // { insertVehicle, insertDriver, insertBooking, listTable, setStatus }

if (USE_SUPABASE) {

  store = require('./lib/store-supabase');

  store.init(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

} else {

  store = require('./lib/store-sqlite');

  store.init(process.env.DB_PATH || path.join(__dirname, 'data', 'ugHELLIRides.db'));

}



app.use(express.json({ limit: '20kb' })); // body size limit



// ─── Security middleware ───────────────────────────────

const rateBuckets = new Map();

function rateLimit(maxPerMin) {

  return (req, res, next) => {

    const ip = req.ip;

    const now = Date.now();

    if (!rateBuckets.has(ip)) rateBuckets.set(ip, { count: 0, resetAt: now + 60000 });

    const b = rateBuckets.get(ip);

    if (now > b.resetAt) { b.count = 0; b.resetAt = now + 60000; }

    b.count++;

    if (b.count > maxPerMin) {

      return res.status(429).json({ error: 'Too many requests. Try again shortly.' });

    }

    next();

  };

}



// Bot honeypot + basic validation

function antiBot(req, res, next) {

  if (req.body._website) return res.status(400).json({ error: 'Rejected' }); // honeypot filled = bot

  next();

}



function requireAdmin(req, res, next) {

  const auth = req.headers.authorization || '';

  if (!auth.startsWith('Bearer ') || auth.slice(7) !== ADMIN_TOKEN) {

    return res.status(401).json({ error: 'Unauthorized' });

  }

  next();

}



// ─── Shared helpers ────────────────────────────────────

const clean = (v, max = 200) => typeof v === 'string' ? v.trim().slice(0, max) : '';

const padRef = (prefix, id) => prefix + '-' + String(id).padStart(5, '0');



// ─── Public endpoints ──────────────────────────────────

app.post('/api/vehicles', rateLimit(5), antiBot, async (req, res) => {

  try {

    const b = req.body;

    if (!b.owner_name || !b.phone || !b.make_model || !b.plate_number) {

      return res.status(400).json({ error: 'Missing required fields' });

    }

    const id = await store.insertVehicle({

      owner_name: clean(b.owner_name, 120),

      phone: clean(b.phone, 30),

      email: clean(b.email, 160),

      city: clean(b.city, 100),

      address: clean(b.address, 300),

      make_model: clean(b.make_model, 120),

      year: parseInt(b.year) || null,

      color: clean(b.color, 40),

      seats: clean(b.seats, 10),

      category: clean(b.category, 60),

      transmission: clean(b.transmission, 20),

      plate_number: clean(b.plate_number, 20).toUpperCase(),

      availability: clean(b.availability, 40),

      license_valid_until: clean(b.license_valid_until, 10),

      insurance_valid_until: clean(b.insurance_valid_until, 10),

      roadworthiness_until: clean(b.roadworthiness_until, 10),

      payout_method: clean(b.payout_method, 60),

      account_details: clean(b.account_details, 120),

    });

    console.log(`[VEHICLE] New registration #${id} from ${b.phone}`);

    res.json({ ok: true, reference: padRef('VH', id) });

  } catch (e) {

    console.error(e);

    res.status(500).json({ error: 'Server error' });

  }

});



app.post('/api/drivers', rateLimit(5), antiBot, async (req, res) => {

  try {

    const b = req.body;

    if (!b.full_name || !b.phone || !b.city) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const id = await store.insertDriver({
      full_name: clean(b.full_name, 120),
      phone: clean(b.phone, 30),
      dob: clean(b.dob, 12),
      gender: clean(b.gender, 12),
      city: clean(b.city, 100),
      address: clean(b.address, 300),
      experience: clean(b.experience, 40),
      license_class: clean(b.license_class, 40),
      license_expiry: clean(b.license_expiry, 12),
      nin_available: clean(b.nin_available, 12),
      transmission_types: clean(b.transmission_types, 30),
      areas_known: clean(b.areas_known, 500),
      availability: clean(b.availability, 40),
      payout_method: clean(b.payout_method, 60),
      account_details: clean(b.account_details, 120),
      owns_vehicle: clean(b.owns_vehicle, 40),
    });

    console.log(`[DRIVER] New application #${id} from ${b.phone}`);

    res.json({ ok: true, reference: padRef('DR', id) });

  } catch (e) {

    console.error(e);

    res.status(500).json({ error: 'Server error' });

  }

});



app.post('/api/bookings', rateLimit(10), antiBot, async (req, res) => {

  try {

    const b = req.body;

    if (!b.customer_name || !b.phone || !b.pickup || !b.destination) {

      return res.status(400).json({ error: 'Missing required fields' });

    }

    const id = await store.insertBooking({

      customer_name: clean(b.customer_name, 120),

      phone: clean(b.phone, 30),

      pickup: clean(b.pickup, 200),

      destination: clean(b.destination, 200),

      pickup_time: clean(b.pickup_time, 30),

      service_type: clean(b.service_type, 60),

      car_preference: clean(b.car_preference, 80),

      notes: clean(b.notes, 500),

    });

    res.json({ ok: true, reference: padRef('BK', id) });

  } catch (e) {

    console.error(e);

    res.status(500).json({ error: 'Server error' });

  }

});

app.post('/api/reviews', rateLimit(10), antiBot, async (req, res) => {

  try {

    const b = req.body;

    const required = ['name', 'rating', 'review_type', 'title', 'message'];

    const missing = required.filter(k => !b[k]);

    if (missing.length > 0) {

      return res.status(400).json({ error: 'Missing required fields: ' + missing.join(', ') });

    }



    const id = await store.insertReview({

      name: clean(b.name, 120),

      email: clean(b.email, 160),

      phone: clean(b.phone, 30),

      rating: parseInt(b.rating) || 5,

      review_type: clean(b.review_type, 40),

      title: clean(b.title, 120),

      message: clean(b.message, 1000),

      booking_reference: clean(b.booking_reference, 30),

      contact_method: clean(b.contact_method, 40),

      status: 'pending'

    });



    console.log(`[REVIEW] New review #${id} from ${b.name}`);



    // Email notification (if SMTP configured)

    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {

      try {

        const transporter = nodemailer.createTransport({

          host: SMTP_HOST,

          port: SMTP_PORT,

          secure: SMTP_PORT === 465,

          auth: { user: SMTP_USER, pass: SMTP_PASS }

        });

        await transporter.sendMail({

          from: EMAIL_FROM,

          to: EMAIL_TO,

          subject: `[UghelliRides] New Review: ${b.review_type} — ${b.rating}/5 ★`,

          text: `New review submitted:



Name: ${b.name}

Email: ${b.email || 'Not provided'}

Phone: ${b.phone || 'Not provided'}

Type: ${b.review_type}

Rating: ${b.rating}/5

Title: ${b.title}

Booking Reference: ${b.booking_reference || 'N/A'}

Preferred Contact: ${b.contact_method || 'Not specified'}



Message:

${b.message}



Review ID: ${id}

Status: Pending admin review`,

        });

        console.log('[REVIEW] Email notification sent');

      } catch (e) {

        console.error('[REVIEW] Email notification failed:', e.message);

      }

    }



    res.json({ ok: true, reference: padRef('RV', id) });

  } catch (e) {

    console.error(e);

    res.status(500).json({ error: 'Server error' });

  }

});





// ─── Admin endpoints ───────────────────────────────────

app.get('/api/admin/:table', requireAdmin, async (req, res) => {

  const table = req.params.table;

  if (!['vehicles', 'drivers', 'bookings'].includes(table)) {

    return res.status(400).json({ error: 'Invalid table' });

  }

  try {

    const rows = await store.listTable(table);

    res.json({ count: rows.length, rows });

  } catch (e) {

    console.error(e);

    res.status(500).json({ error: 'Server error' });

  }

});



app.patch('/api/admin/:table/:id/status', requireAdmin, async (req, res) => {

  const table = req.params.table;

  if (!['vehicles', 'drivers', 'bookings'].includes(table)) {

    return res.status(400).json({ error: 'Invalid table' });

  }

  // Statuses are validated per table so they always match the Supabase enums.

  const VALID_STATUS = {

    vehicles: ['pending', 'verified', 'active', 'rejected'],

    drivers:  ['pending', 'verified', 'active', 'rejected'],

    bookings: ['new', 'assigned', 'completed', 'cancelled'],

  };

  const status = VALID_STATUS[table].includes(req.body?.status) ? req.body.status : null;

  if (!status) return res.status(400).json({ error: 'Invalid status' });

  try {

    await store.setStatus(table, req.params.id, status);

    res.json({ ok: true });

  } catch (e) {

    console.error(e);

    res.status(500).json({ error: 'Server error' });

  }

});



// ─── Health ────────────────────────────────────────────

app.get('/api/health', (req, res) => {

  res.json({ ok: true, backend: USE_SUPABASE ? 'supabase' : 'sqlite' });

});



// ─── Static frontend ───────────────────────────────────

app.use(express.static(path.join(__dirname), { maxAge: '1d' }));



// ─── Start ─────────────────────────────────────────────

app.listen(PORT, () => {

  console.log('════════════════════════════════════════');

  console.log('  UghelliRides backend running on :' + PORT);

  console.log('  Storage: ' + (USE_SUPABASE ? 'Supabase (PostgreSQL)' : 'SQLite (local)'));

  console.log('  Admin token: ' + ADMIN_TOKEN);

  console.log('════════════════════════════════════════');

});







// ─── Opay Payments ────────────────────────────────────

app.post('/api/payments/opay/initialize', rateLimit(5), async (req, res) => {

  try {

    const { amount, phone, reference, callback_url } = req.body;

    if (!amount || !phone || !reference) {

      return res.status(400).json({ error: 'Missing required fields: amount, phone, reference' });

    }

    

    // Initialize Opay transaction

    const opayData = {

      merchant_id: process.env.OPAY_MERCHANT_ID,

      app_id: process.env.OPAY_APP_ID || '',

      notify_url: callback_url || '',

      amount: String(amount),

      currency: 'NGN',

      order_id: reference,

      customer_phone: phone,

    };

    

    // In production, this would call Opay's API

    // For now, return a payment URL for the customer to complete payment

    const payment_url = 'https://example.com/payment?amount=' + amount + '&reference=' + reference;

    

    res.json({

      ok: true,

      payment_url: payment_url,

      transaction_id: 'OP-' + Date.now(),

      reference: reference,

      message: 'Please complete payment via the link above'

    });

  } catch (e) {

    console.error('Opay initialize error:', e);

    res.status(500).json({ error: 'Payment initialization failed' });

  }

});



app.post('/api/payments/opay/verify', rateLimit(10), async (req, res) => {

  try {

    const { transaction_id, reference, status, signature } = req.body;

    

    // Verify Opay webhook signature

    const expected_signature = crypto

      .createHmac('sha256', process.env.OPAY_SECRET)

      .update(JSON.stringify(req.body))

      .digest('hex');

    

    if (signature !== expected_signature) {

      return res.status(401).json({ error: 'Invalid signature' });

    }

    

    if (status === 'success' || status === 'completed') {

      // Update booking status to paid

      await store.setStatus('bookings', reference.replace('BK-', ''), 'paid');

      res.json({ ok: true, status: 'paid', reference: reference });

    } else {

      res.json({ ok: true, status: 'failed', reference: reference });

    }

  } catch (e) {

    console.error('Opay verify error:', e);

    res.status(500).json({ error: 'Payment verification failed' });

  }

});