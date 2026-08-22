# Männerkreis Vestenbergsgreuth

Statische Landingpage für den Männerkreis Vestenbergsgreuth (Andreas Böhm).

Nachbau der ursprünglich bei Manus gehosteten Seite – ohne Build-Schritt,
ohne Framework, ohne externe Abhängigkeiten zur Laufzeit.

## Struktur

```
index.html              Startseite
impressum.html          Impressum (Platzhalter ausfüllen)
datenschutz.html        Datenschutzerklärung (Platzhalter ausfüllen)
assets/
  styles.css            Basis-Stylesheet (Utility-Klassen, Scroll-Animationen)
  interactions.css      Hover-, Focus- und Aufklapp-Zustände
  consent.css           Einwilligungsbanner
  legal.css             Impressum und Datenschutzerklärung
  fonts.css             @font-face-Regeln für die lokalen Schriften
  site.js               Navigation, FAQ, Sticky-CTA, Kontaktformular
  consent.js            Einwilligungsverwaltung
  fonts/                Playfair Display und Inter als woff2 (SIL OFL)
images/                 Bilder der Seite
```

## Wichtige Eigenschaften

- **Keine externen Requests.** Schriften liegen lokal, damit beim Seitenaufruf
  keine Besucher-IP an Google übertragen wird.
- **Keine Cookies, kein Tracking.** Gespeichert wird ausschließlich die
  Entscheidung aus dem Einwilligungsbanner (`localStorage`, `mk-consent-v1`).
- **Kontaktformular ohne Backend.** Das Formular öffnet eine vorausgefüllte
  E-Mail im Mailprogramm des Besuchers. Es werden keine Daten an einen Server
  übertragen.

## Künftige Dienste einbinden

Skripte, die eine Einwilligung brauchen, nicht direkt einbinden, sondern über
die Consent-API starten:

```js
mkConsent.onGranted('statistics', function () {
  // Skript erst hier laden
});
```

## Lokal ansehen

```bash
python3 -m http.server 5180
```

Dann http://localhost:5180 öffnen.

## Deployment

Vercel, Projekt `maennerkreis` (Team koala-crunch), Domain `maennerkreis.org`.

```bash
npx vercel@latest deploy --prod
```
