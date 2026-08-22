/* ---------------------------------------------------------------------------
   Männerkreis Vestenbergsgreuth – Seitenlogik
   Ersetzt 1:1 das Verhalten der ursprünglichen React-Komponente:
   Scroll-Animationen, sanftes Scrollen, mobiles Menü, FAQ-Akkordeon,
   Sticky-CTA ab 600px Scrolltiefe und das Kontaktformular (mailto).
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var MAIL = 'praxis-boehm@t-online.de';

  /* --- Einblend-Animation beim Scrollen --- */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-up').forEach(function (el) { observer.observe(el); });

  /* --- Sanftes Scrollen mit 80px Offset für die fixe Navigation --- */
  function scrollToTarget(selector) {
    var target = document.querySelector(selector);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var href = link.getAttribute('href');
      if (!href || href === '#') return;
      event.preventDefault();
      closeMenu();
      scrollToTarget(href);
    });
  });

  /* --- Mobiles Menü --- */
  var menu = document.getElementById('mobile-menu');
  var openBtn = document.getElementById('menu-open');
  var closeBtn = document.getElementById('menu-close');

  function openMenu() { if (menu) menu.classList.add('is-open'); }
  function closeMenu() { if (menu) menu.classList.remove('is-open'); }

  if (openBtn) openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeMenu();
  });

  /* --- FAQ-Akkordeon --- */
  document.querySelectorAll('.faq-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      var item = button.closest('.faq-item');
      if (!item) return;
      var open = item.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* --- Sticky-CTA ab 600px Scrolltiefe --- */
  var sticky = document.getElementById('sticky-cta');
  function updateSticky() {
    if (!sticky) return;
    sticky.classList.toggle('is-visible', window.scrollY > 600);
  }
  window.addEventListener('scroll', updateSticky, { passive: true });
  updateSticky();

  /* --- Kontaktformular: öffnet eine vorausgefüllte E-Mail --- */
  var form = document.getElementById('interest-form');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      function value(id) {
        var field = form.querySelector('#' + id);
        return field ? field.value.trim() : '';
      }

      var firstName = value('firstName');
      var email = value('email');
      if (!firstName || !email) {
        alert('Bitte fülle mindestens Vorname und E-Mail aus.');
        return;
      }

      var lastName = value('lastName');
      var phone = value('phone');
      var age = value('age');
      var message = value('message');

      var subject = 'Interesse am Männerkreis Vestenbergsgreuth – ' + firstName + ' ' + lastName;
      var body = 'Hallo Andreas,\n\n'
        + 'ich habe Interesse am Männerkreis Vestenbergsgreuth und möchte mehr erfahren.\n\n'
        + '--- Meine Angaben ---\n'
        + 'Name: ' + firstName + ' ' + lastName + '\n'
        + 'E-Mail: ' + email + '\n';
      if (phone) body += 'Telefon: ' + phone + '\n';
      if (age) body += 'Altersgruppe: ' + age + ' Jahre\n';
      if (message) body += '\nNachricht:\n' + message + '\n';
      body += '\nViele Grüße,\n' + firstName;

      window.location.href = 'mailto:' + MAIL
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      var content = document.getElementById('form-body');
      var success = document.getElementById('form-success');
      if (content) content.hidden = true;
      if (success) success.hidden = false;
    });
  }
})();
