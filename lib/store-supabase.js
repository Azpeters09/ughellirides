/**
 * Supabase storage adapter for UghelliRides.
 * Uses the SERVICE ROLE key (server-side only) which bypasses RLS.
 */
const { createClient } = require('@supabase/supabase-js');

let supabase;

function init(url, serviceRoleKey) {
  supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const TABLE_MAP = {
  vehicles: 'vehicles',
  drivers: 'drivers',
  bookings: 'bookings',
  reviews: 'reviews'
};;

// Strip null/undefined fields so Postgres column defaults apply cleanly.
function compact(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));
}

async function insertVehicle(data) {
  const { data: row, error } = await supabase
    .from('vehicles')
    .insert(compact(data))
    .select('id')
    .single();
  if (error) throw error;
  return row.id;
}

async function insertDriver(data) {
  const { data: row, error } = await supabase
    .from('drivers')
    .insert(compact(data))
    .select('id')
    .single();
  if (error) throw error;
  return row.id;
}

async function insertBooking(data) {
  const { data: row, error } = await supabase
    .from('bookings')
    .insert(compact(data))
    .select('id')
    .single();
  if (error) throw error;
  return row.id;
}

async function listTable(table) {
  const { data, error } = await supabase
    .from(TABLE_MAP[table])
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data || [];
}

async function setStatus(table, id, status) {
  const { error } = await supabase
    .from(TABLE_MAP[table])
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}


async function insertReview(data) {
  const { data: result, error } = await supabase
    .from('reviews')
    .insert({
      name: String(data.name || '').slice(0, 120),
      email: String(data.email || '').slice(0, 160),
      phone: String(data.phone || '').slice(0, 30),
      rating: parseInt(data.rating) || 5,
      review_type: String(data.review_type || '').slice(0, 40),
      title: String(data.title || '').slice(0, 120),
      message: String(data.message || '').slice(0, 1000),
      booking_reference: String(data.booking_reference || '').slice(0, 30),
      contact_method: String(data.contact_method || '').slice(0, 40),
      status: 'pending'
    })
    .select('id')
    .single();
  if (error) throw error;
  return result?.id || null;
}

module.exports = { init, insertVehicle, insertDriver, insertBooking, insertReview, listTable, setStatus };
