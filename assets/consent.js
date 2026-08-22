/* ---------------------------------------------------------------------------
   Einwilligungsverwaltung (Cookie-Banner)

   Rechtlicher Hintergrund: Eine Einwilligung ist nur für Speicherzugriffe
   nötig, die nicht technisch erforderlich sind (§ 25 TDDDG, DSGVO Art. 6).
   Diese Seite setzt derzeit KEINE Cookies und lädt KEINE fremden Dienste –
   Schriften liegen lokal. Gespeichert wird ausschließlich die Entscheidung
   selbst; das ist technisch erforderlich und einwilligungsfrei.

   Der Banner ist damit vorsorglich und vorbereitend: Sobald später ein
   Dienst dazukommt (Statistik, Karte, Video, Schriften von Dritten), wird
   er über mkConsent.onGranted('statistics', …) sauber freigeschaltet und
   läuft erst nach aktiver Zustimmung.

   Verwendung für künftige Dienste:
     mkConsent.onGranted('statistics', function () { … Skript laden … });
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var STORAGE_KEY = 'mk-consent-v1';
  var CATEGORIES = ['statistics'];

  /* --- Gespeicherte Entscheidung lesen / schreiben --- */
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null; // z. B. Speicher blockiert oder Privatmodus
    }
  }

  function save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* Ohne Speicher fragen wir beim nächsten Aufruf erneut. */
    }
  }

  var state = load();
  var listeners = {};

  /* --- Öffentliche Schnittstelle --- */
  var api = {
    has: function (category) {
      return !!(state && state.categories && state.categories[category]);
    },
    onGranted: function (category, callback) {
      if (api.has(category)) { callback(); return; }
      (listeners[category] = listeners[category] || []).push(callback);
    },
    open: function () { render(true); },
    reset: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      state = null;
      render(true);
    }
  };
  window.mkConsent = api;

  function apply(categories) {
    state = {
      version: 1,
      timestamp: new Date().toISOString(), // Nachweis, wann eingewilligt wurde
      categories: categories
    };
    save(state);
    CATEGORIES.forEach(function (c) {
      if (categories[c] && listeners[c]) {
        listeners[c].forEach(function (fn) { fn(); });
        listeners[c] = [];
      }
    });
    close();
  }

  /* --- Banner aufbauen --- */
  var banner = null;

  function build() {
    var el = document.createElement('div');
    el.className = 'consent-banner';
    el.id = 'consent-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'false');
    el.setAttribute('aria-labelledby', 'consent-title');
    el.hidden = true;
    el.innerHTML =
      '<h2 class="consent-title" id="consent-title">Datenschutz-Einstellungen</h2>' +
      '<p class="consent-text">Diese Website nutzt nur technisch notwendige Speicherung – ' +
      'es werden keine Cookies zu Werbezwecken gesetzt und keine Daten an Dritte übertragen. ' +
      'Optionale Funktionen aktivierst du hier selbst. Details in der ' +
      '<a href="datenschutz.html">Datenschutzerklärung</a>.</p>' +
      '<div class="consent-actions">' +
        '<button type="button" class="consent-btn consent-btn-reject" data-action="reject">Nur notwendige</button>' +
        '<button type="button" class="consent-btn consent-btn-accept" data-action="accept">Alle akzeptieren</button>' +
      '</div>' +
      '<details class="consent-details">' +
        '<summary>Einstellungen anzeigen</summary>' +
        '<div class="consent-category">' +
          '<input type="checkbox" id="consent-necessary" checked disabled>' +
          '<label for="consent-necessary"><strong>Notwendig</strong>' +
          '<span>Speichert ausschließlich deine Entscheidung aus diesem Banner, damit du sie ' +
          'nicht bei jedem Besuch erneut treffen musst. Ohne Einwilligung zulässig.</span></label>' +
        '</div>' +
        '<div class="consent-category">' +
          '<input type="checkbox" id="consent-statistics" data-category="statistics">' +
          '<label for="consent-statistics"><strong>Statistik &amp; externe Medien</strong>' +
          '<span>Derzeit nicht im Einsatz. Wird erst relevant, wenn Reichweitenmessung oder ' +
          'eingebettete Inhalte hinzukommen – dann ausschließlich nach deiner Zustimmung.</span></label>' +
        '</div>' +
        '<div class="consent-actions" style="margin-top:1.1rem">' +
          '<button type="button" class="consent-btn consent-btn-reject" data-action="save">Auswahl speichern</button>' +
        '</div>' +
      '</details>';

    el.addEventListener('click', function (event) {
      var action = event.target.getAttribute('data-action');
      if (!action) return;
      if (action === 'accept') return apply({ statistics: true });
      if (action === 'reject') return apply({ statistics: false });
      if (action === 'save') {
        var chosen = {};
        CATEGORIES.forEach(function (c) {
          var box = el.querySelector('[data-category="' + c + '"]');
          chosen[c] = !!(box && box.checked);
        });
        return apply(chosen);
      }
    });

    document.body.appendChild(el);
    return el;
  }

  function render(force) {
    if (!force && state) return;          // Entscheidung liegt vor – nichts zeigen
    if (!banner) banner = build();
    CATEGORIES.forEach(function (c) {     // gespeicherte Auswahl vorbelegen
      var box = banner.querySelector('[data-category="' + c + '"]');
      if (box) box.checked = api.has(c);
    });
    banner.hidden = false;
    requestAnimationFrame(function () { banner.classList.add('is-visible'); });
  }

  function close() {
    if (!banner) return;
    banner.classList.remove('is-visible');
    setTimeout(function () { banner.hidden = true; }, 350);
  }

  /* --- Start --- */
  var reopen = document.getElementById('consent-reopen');
  if (reopen) reopen.addEventListener('click', function () { render(true); });

  // Bereits getroffene Entscheidung nachträglich wirksam machen
  if (state) {
    CATEGORIES.forEach(function (c) {
      if (api.has(c) && listeners[c]) {
        listeners[c].forEach(function (fn) { fn(); });
        listeners[c] = [];
      }
    });
  } else {
    render();
  }
})();
