/**
 * UghelliRides Booking Modal — shared component
 * Injects a floating booking form into any page, saves the booking
 * via /api/bookings, and opens WhatsApp to conclude the transaction.
 *
 * Include with:  <script src="/assets/booking-modal.js" defer></script>
 * Trigger with:  openBookingModal()  (optionally pass a vehicle type)
 */
(function () {
  'use strict';

  const WHATSAPP_NUMBER = '2348065711644'; // UghelliRides bookings line

  // ── Build modal DOM once ───────────────────────────────
  function buildModal() {
    if (document.getElementById('bookingModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'bookingModal';
    overlay.className = 'ur-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Book a car');
    overlay.innerHTML = `
      <div class="ur-modal-card" role="document">
        <button class="ur-modal-close" type="button" aria-label="Close" data-close>&times;</button>
        <div class="ur-modal-head">
          <span class="ur-eyebrow">Reserve in under 2 minutes</span>
          <h2 class="ur-title">Book a car</h2>
          <p class="ur-sub">Tell us your trip — we confirm car &amp; driver within 15 minutes.</p>
        </div>
        <form id="urBookingForm" novalidate>
          <div class="ur-field">
            <label for="urName">Your name <span class="ur-req">*</span></label>
            <input id="urName" name="customer_name" type="text" required autocomplete="name" placeholder="e.g. Chinedu Okoro">
          </div>
          <div class="ur-field">
            <label for="urPhone">Phone / WhatsApp <span class="ur-req">*</span></label>
            <input id="urPhone" name="phone" type="tel" required autocomplete="tel" placeholder="e.g. 0803 456 7890">
          </div>
          <div class="ur-grid">
            <div class="ur-field">
              <label for="urPickup">Pickup location <span class="ur-req">*</span></label>
              <input id="urPickup" name="pickup" type="text" required placeholder="Where are you now?">
            </div>
            <div class="ur-field">
              <label for="urDestination">Destination <span class="ur-req">*</span></label>
              <input id="urDestination" name="destination" type="text" required placeholder="Where are you going?">
            </div>
          </div>
          <div class="ur-grid">
            <div class="ur-field">
              <label for="urType">Request type <span class="ur-req">*</span></label>
              <select id="urType" name="service_type" required>
                <option value="" selected disabled>Select…</option>
                <option value="Drop-off">Drop-off</option>
                <option value="Full day booking">Full day booking</option>
                <option value="Charter">Charter</option>
              </select>
            </div>
            <div class="ur-field">
              <label for="urVehicle">Vehicle type <span class="ur-req">*</span></label>
              <select id="urVehicle" name="car_preference" required>
                <option value="" selected disabled>Select…</option>
                <option value="Economy">Economy</option>
                <option value="SUV">SUV</option>
                <option value="Executive">Executive</option>
                <option value="Group (Sienna/Hiace)">Group (Sienna / Hiace)</option>
                <option value="Luxury">Luxury</option>
                <option value="Wedding Package">Wedding Package</option>
              </select>
            </div>
          </div>
          <div class="ur-field">
            <label for="urWhen">Date &amp; time <span class="ur-req">*</span></label>
            <input id="urWhen" name="pickup_time" type="datetime-local" required>
          </div>
          <div class="ur-field">
            <label for="urNotes">Special notes <span class="ur-opt">(optional)</span></label>
            <textarea id="urNotes" name="notes" rows="3" placeholder="Flight number, luggage, extra stops, child seat…"></textarea>
          </div>
          <div class="ur-err" id="urError" hidden></div>
          <button type="submit" class="ur-submit" id="urSubmit">
            <span>Submit booking</span>
          </button>
          <p class="ur-fine">By submitting you agree to our <a href="/privacy.html" target="_blank">privacy policy</a>. You'll be redirected to WhatsApp to confirm.</p>
        </form>
      </div>
    `;

    // Minimal inline styles so the modal looks right on every page
    const style = document.createElement('style');
    style.textContent = `
      .ur-modal{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(10,20,16,.55);backdrop-filter:blur(6px)}
      .ur-modal.is-open{display:flex}
      .ur-modal-card{position:relative;width:100%;max-width:520px;max-height:92vh;overflow-y:auto;background:#FBF9F3;border:1px solid #E2DDCE;border-radius:18px;padding:30px 28px;box-shadow:0 30px 80px rgba(0,0,0,.35);animation:urIn .28s cubic-bezier(.22,.61,.36,1)}
      @keyframes urIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}
      .ur-modal-close{position:absolute;top:14px;right:16px;width:36px;height:36px;border:none;background:transparent;font-size:30px;line-height:1;color:#5C675F;cursor:pointer;border-radius:50%}
      .ur-modal-close:hover{background:#F3EFE4;color:#16231E}
      .ur-eyebrow{display:inline-block;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#A9853B;margin-bottom:10px}
      .ur-title{font-family:'Bricolage Grotesque',Inter,sans-serif;font-size:26px;font-weight:600;color:#16231E;margin:0 0 6px}
      .ur-sub{font-size:14px;color:#5C675F;margin:0 0 22px}
      .ur-field{margin-bottom:14px}
      .ur-field label{display:block;font-size:13px;font-weight:600;color:#16231E;margin-bottom:6px}
      .ur-req{color:#C0392B}.ur-opt{color:#8a938c;font-weight:400}
      .ur-field input,.ur-field select,.ur-field textarea{width:100%;padding:12px 14px;border:1.5px solid #E2DDCE;border-radius:10px;font:inherit;font-size:14.5px;color:#16231E;background:#fff;transition:border-color .15s}
      .ur-field input:focus,.ur-field select:focus,.ur-field textarea:focus{outline:none;border-color:#C9A24B}
      .ur-field textarea{resize:vertical;min-height:70px}
      .ur-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      @media(max-width:520px){.ur-grid{grid-template-columns:1fr}}
      .ur-submit{width:100%;padding:15px;border:none;border-radius:100px;background:#16231E;color:#FBF9F3;font:inherit;font-size:15px;font-weight:600;cursor:pointer;transition:background .2s,transform .1s}
      .ur-submit:hover{background:#A9853B}
      .ur-submit:disabled{opacity:.6;cursor:not-allowed}
      .ur-err{background:#FDEBEB;color:#C0392B;border:1px solid #F5C6C6;border-radius:8px;padding:10px 14px;font-size:13.5px;margin-bottom:12px}
      .ur-fine{font-size:12px;color:#8a938c;text-align:center;margin:14px 0 0}
      .ur-fine a{color:#A9853B;text-decoration:none}
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // Wire up events
    const modal = document.getElementById('bookingModal');
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.hasAttribute('data-close')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
    document.getElementById('urBookingForm').addEventListener('submit', onSubmit);
  }

  function openModal(vehicle) {
    buildModal();
    const modal = document.getElementById('bookingModal');
    if (vehicle) {
      const sel = document.getElementById('urVehicle');
      const v = String(vehicle).toLowerCase();
      const opt = Array.from(sel.options).find(function (o) {
        const ov = o.value.toLowerCase();
        return ov === v || ov.indexOf(v) === 0 || v.indexOf(ov) === 0;
      });
      if (opt) sel.value = opt.value;
    }
    // Default the date to tomorrow at a sensible time if empty
    const when = document.getElementById('urWhen');
    if (!when.value) {
      const d = new Date(Date.now() + 24 * 3600 * 1000);
      d.setMinutes(0, 0, 0);
      const iso = d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + 'T' +
        String(d.getHours()).padStart(2, '0') + ':00';
      when.value = iso;
    }
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () { document.getElementById('urName').focus(); }, 60);
  }

  function closeModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) { modal.classList.remove('is-open'); document.body.style.overflow = ''; }
  }

  function showError(msg) {
    const el = document.getElementById('urError');
    el.textContent = msg;
    el.hidden = false;
  }
  function clearError() {
    const el = document.getElementById('urError');
    el.hidden = true;
  }

  function onSubmit(e) {
    e.preventDefault();
    clearError();

    const form = document.getElementById('urBookingForm');
    const data = {
      customer_name: form.customer_name.value.trim(),
      phone: form.phone.value.trim(),
      pickup: form.pickup.value.trim(),
      destination: form.destination.value.trim(),
      service_type: form.service_type.value,
      car_preference: form.car_preference.value,
      pickup_time: form.pickup_time.value,
      notes: form.notes.value.trim()
    };

    // Basic validation
    if (!data.customer_name) return showError('Please enter your name.');
    if (!data.phone) return showError('Please enter your phone / WhatsApp number.');
    if (!data.pickup) return showError('Please enter your pickup location.');
    if (!data.destination) return showError('Please enter your destination.');
    if (!data.service_type) return showError('Please choose a request type.');
    if (!data.car_preference) return showError('Please choose a vehicle type.');
    if (!data.pickup_time) return showError('Please choose a date & time.');

    const btn = document.getElementById('urSubmit');
    btn.disabled = true;
    btn.innerHTML = '<span>Submitting…</span>';

    // 1) Save to backend
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
      .then(function (res) {
        if (!res.ok || !res.body.ok) {
          throw new Error(res.body.error || 'Server error');
        }
        return res.body.reference;
      })
      .then(function (reference) {
        // 2) Build WhatsApp message and redirect
        const fmt = function (s) {
          return s ? s.replace('T', ' at ').replace(/:00$/, '') : s;
        };
        const lines = [
          '*UghelliRides — Booking Request*',
          '',
          'Name: ' + data.customer_name,
          'Phone: ' + data.phone,
          'Trip: ' + data.pickup + ' → ' + data.destination,
          'Type: ' + data.service_type,
          'Vehicle: ' + data.car_preference,
          'When: ' + fmt(data.pickup_time),
        ];
        if (data.notes) lines.push('Notes: ' + data.notes);
        lines.push('');
        lines.push('Reference: ' + reference);
        lines.push('');
        lines.push('_(Submitted via website — please confirm availability & price.)_');

        const waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));

        // Reset form for next time
        form.reset();
        btn.disabled = false;
        btn.innerHTML = '<span>Submit booking</span>';
        closeModal();

        // Open WhatsApp in a new tab to conclude the transaction
        window.open(waUrl, '_blank', 'noopener');
      })
      .catch(function (err) {
        btn.disabled = false;
        btn.innerHTML = '<span>Submit booking</span>';
        showError(err.message || 'Something went wrong. Please try again.');
      });
  }

  // Expose globally
  window.openBookingModal = function (vehicle) { openModal(vehicle); };
  window.closeBookingModal = closeModal;

  // Auto-wire any element with data-book attr (for pages that can't edit inline)
  document.addEventListener('click', function (e) {
    const trigger = e.target.closest('[data-book]');
    if (trigger) {
      e.preventDefault();
      openModal(trigger.getAttribute('data-book') || undefined);
    }
  });

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildModal);
  } else {
    buildModal();
  }
})();
