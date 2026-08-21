<div align="center">

# WHIP Leipzig

**Welcome Home Innocent Pervs.**

Die Webseite des WHIP-Stammtischs in Leipzig.

[![Publish Website](https://github.com/WHIP-Leipzig/whip-leipzig.github.io/actions/workflows/main.yml/badge.svg)](https://github.com/WHIP-Leipzig/whip-leipzig.github.io/actions/workflows/main.yml)
[![Node](https://img.shields.io/badge/node-%E2%89%A526-339933.svg)](.nvmrc)
[![Eleventy](https://img.shields.io/badge/11ty-3.x-000000.svg)](https://www.11ty.dev/)

[Quick Start](#quick-start) · [Struktur](#projektstruktur) · [Mehrsprachigkeit](#mehrsprachigkeit) · [Deployment](#deployment)

</div>

---

[whip-leipzig.de](https://whip-leipzig.de) informiert über den WHIP-Stammtisch, eine
BDSM-Community in Leipzig für Menschen unter ca. 40 Jahren, die auf Konsens, Kommunikation und
Respekt aufbaut. Es gibt keine Formulare und kein Backend; die Seite besteht nur aus Markdown,
das zu HTML gebaut wird.

Sie basiert auf [Eleventy](https://www.11ty.dev/) und [Pico CSS](https://picocss.com/) und wird
per GitHub Actions als statische Seite auf GitHub Pages veröffentlicht.

## Quick Start

Voraussetzung: **Node.js ≥ 26** ([.nvmrc](.nvmrc)).

```bash
git clone git@github.com:WHIP-Leipzig/whip-leipzig.github.io.git whip-website
cd whip-website
nvm use            # oder: nvm install 26 && nvm use 26
npm ci
npm start
```

Eleventy startet einen lokalen Server mit Live-Reload (Standard: `http://localhost:8080`) und
schreibt die URL beim Start ins Terminal.

Ein Produktions-Build (Ausgabe landet in `_site/`):

```bash
npm run build
```

Die [Makefile](Makefile) bietet dieselben Schritte als Kurzbefehle: `make dev`, `make setup`,
`make build`, `make reset` (Dependencies neu installieren).

## Projektstruktur

```
_src/
├── _data/                ← globale Daten: Navigation, Termine, Kalender-Metadaten, Slug-Mapping
├── _includes/
│   ├── base.njk            ← Standard-Layout für Textseiten (Titel + Markdown-Inhalt)
│   ├── start-de.njk          ← Layout der deutschen Startseite, inkl. Terminliste
│   ├── start-en.njk           ← Layout der englischen Startseite
│   └── templates/               ← Header (Sprachumschalter, Hauptnavigation) und Footer (rechtliche Links)
├── assets/
│   ├── css/                       ← SCSS auf Basis von Pico CSS
│   ├── fonts/                      ← selbst gehostete WOFF2-Schrift
│   └── img/                         ← Logo
├── en/                                ← englische Inhalte, spiegeln die deutschen Seiten
├── *.md                                ← deutsche Inhalte: Startseite, FAQ, Konzept, Prinzipien, Kontakt, rechtliche Seiten
├── feed.11ty.js                         ← generiert den iCal-Feed /treffen.ics aus den Terminen
├── redirects.11ty.js                     ← generiert Weiterleitungsseiten für alte, umbenannte englische URLs
└── sitemap.11ty.js                        ← generiert /sitemap.xml
```

## Mehrsprachigkeit

Deutsch liegt direkt unter `_src/`, Englisch unter `_src/en/`. Beides sind unabhängige
Markdown-Dateien, es gibt keine automatische Übersetzung.

Die URL der jeweils anderen Sprachversion für den Sprachumschalter im Header wird über den
`translateUrl`-Filter in [.eleventy.js](.eleventy.js) berechnet. Da sich deutsche und englische
Slugs unterscheiden (`/konzept.html` ↔ `/en/concept.html`), pflegt
[_src/_data/slugTranslations.json](_src/_data/slugTranslations.json) die Zuordnung. Dieselbe
Datei erzeugt zugleich die Redirects für alte, mittlerweile umbenannte englische URLs.

> [!WARNING]
> Rechtliche Texte (Datenschutz, Impressum) existieren in beiden Sprachen als vollständig
> eigenständige Dateien. Faktische Änderungen (z.B. Hosting-Anbieter) müssen von Hand in
> **beiden** Sprachversionen nachgezogen werden.

## Termine & Kalender

Termine werden zentral in [_src/_data/meetings.json](_src/_data/meetings.json) gepflegt (Typ,
Datum, optionales Thema). Daraus entstehen automatisch:

- die Terminliste auf der Startseite
- ein abonnierbarer iCal-Feed unter `/treffen.ics`

## Deployment

Jeder Push auf `main` löst [.github/workflows/main.yml](.github/workflows/main.yml) aus: Build
mit Eleventy, Veröffentlichung über GitHub Pages. Eine Staging-Umgebung gibt es nicht, `main`
ist production.

## Mitwirken

Konventionen, wiederkehrende Fallstricke (Slug-Mapping, CSP-Hash, mehrsprachige Rechtstexte) und
Vorgehen für KI-Coding-Assistenten stehen in [AGENTS.md](AGENTS.md).

## Lizenz

Alle Rechte vorbehalten.
