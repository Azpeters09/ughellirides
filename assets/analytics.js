/**
 * UghelliRides — Analytics (Google Analytics 4 + consent banner)
 *
 * Behaviour:
 *  1. Shows a cookie-consent banner on first visit (GDPR/NDPR compliant).
 *  2. Only loads GA4 after the visitor accepts (or dismisses) — never before.
 *  3. Stores the choice in localStorage so the banner doesn't reappear.
 *
 * The GA4 Measurement ID is set per-page via:
 *   <script>window.UGHELLI_GA_ID = "G-XXXXXXXXXX";</script>
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'ughellirides_consent';
  var GA_ID = window.UGHELLI_GA_ID || '';

  // ── 1. Banner injection ────────────────────────────────
  function injectBanner() {
    var banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.style.cssText = [
      'position:fixed;bottom:0;left:0;right:0;z-index:9999;',
      'background:#0E1F1A;color:#FBF9F3;',
      'padding:16px 20px;display:flex;flex-wrap:wrap;gap:12px;',
      'align-items:center;justify-content:center;',
      'font-family:Inter,system-ui,sans-serif;font-size:14px;',
      'box-shadow:0 -6px 24px rgba(14,31,26,.25);'
    ].join('');
    banner.innerHTML =
      '<span style="max-width:640px;line-height:1.5">' +
        'We use cookies to understand how visitors use our site and improve your experience. ' +
        'See our <a href="/privacy.html" style="color:#C9A24B">privacy policy</a>. ' +
      '</span>' +
      '<span style="display:flex;gap:10px;flex-wrap:wrap">' +
        '<button id="consent-accept" style="background:#C9A24B;color:#0E1F1A;border:none;' +
          'padding:9px 20px;border-radius:100px;font-weight:600;cursor:pointer;font-family:inherit;">Accept</button>' +
        '<button id="consent-decline" style="background:transparent;color:#FBF9F3;border:1px solid rgba(255,255,255,.35);' +
          'padding:9px 20px;border-radius:100px;font-weight:500;cursor:pointer;font-family:inherit;">Decline</button>' +
      '</span>';
    document.body.appendChild(banner);
  }

  function hideBanner() {
    var b = document.getElementById('consent-banner');
    if (b) b.remove();
  }

  // ── 2. GA4 loader (only called after consent) ──────────
  function loadGA() {
    if (!GA_ID) return;
    if (window.gtag) return; // already loaded
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
  }

  // ── 3. Initialise based on stored consent ──────────────
  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}

  if (stored === 'accepted') {
    loadGA();
  } else if (stored === 'declined') {
    // do nothing — no tracking
  } else {
    // First visit: show banner
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectBanner);
    } else {
      injectBanner();
    }
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.id === 'consent-accept') {
        try { localStorage.setItem(STORAGE_KEY, 'accepted'); } catch (err) {}
        hideBanner();
        loadGA();
      } else if (t && t.id === 'consent-decline') {
        try { localStorage.setItem(STORAGE_KEY, 'declined'); } catch (err) {}
        hideBanner();
      }
    });
  }
})();
