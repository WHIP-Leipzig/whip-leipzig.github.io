# AGENTS.md

Notes for AI coding assistants (and humans) working in this repo. For the project description
itself, see [README.md](README.md).

## What this is

A fully static [Eleventy](https://www.11ty.dev/) site, bilingual (DE/EN), served via GitHub
Pages. No backend, no build step beyond Eleventy + Sass, no client-side JavaScript except a
single CSS-preload polyfill in the `<head>`.

## Commands

```bash
npm ci             # install dependencies (not npm install, see package-lock.json)
npm start          # dev server with live reload
npm run build      # production build into _site/
npm audit          # there are no automated tests — a clean build + npm audit is the check
```

The Node version is pinned in [.nvmrc](.nvmrc) and `package.json#engines` (currently 26+). Both
must stay in sync, as must `node-version` in `.github/workflows/main.yml` and the install
instructions in the README.

Before any commit that touches templates/data/config: `npm run build` must run without errors
and produce all expected pages under `_site/` (currently 22 files: DE and EN pages,
`sitemap.xml`, `treffen.ics`, redirect pages, `app.css`).

## Structure worth knowing

- `_src/*.md` = German content, `_src/en/*.md` = English content. These are independent files,
  not an automated translation.
- `_src/_data/slugTranslations.json` maps German slugs to English ones (e.g. `konzept` →
  `concept`). This one file drives two things at once:
  - the language switcher in the header (`translateUrl` filter in `.eleventy.js`)
  - the auto-generated redirects for old, renamed EN URLs (`_src/redirects.11ty.js`)

  **New page with a translated slug → add an entry here**, or the language switcher will point
  nowhere.
- `_src/_data/navigation.json` / `_src/en/en.11tydata.json` (the `navigation` field) and
  `_src/_data/legallinks.json` / the same file (`legallinks` field) maintain header and footer
  navigation separately per language. A new page in the main nav needs entries in both language
  variants.
- `_src/_data/page.json` defines `page.title` as a global fallback title. This works because
  Eleventy deep-merges global data into its reserved `page` variable — not obvious, but
  intentional. Don't accidentally introduce another top-level `page` key that would clobber it.
- `_src/_data/meetings.json` is the single source of truth for meeting dates. It feeds both the
  meeting list on the homepage (`start-de.njk`/`start-en.njk`) and the iCal feed
  (`_src/feed.11ty.js`, served as `/treffen.ics`). A meeting without a `topic` needs the empty
  string `""`, not `null` — the templates check for falsy values.

## Legal pages (privacy policy, imprint) — handle with care

`_src/datenschutz.md` and `_src/en/privacy.md` (likewise `impressum.md`/`en/imprint.md`) are
fully independent files, not a translation generated from one source. These have already drifted
apart in practice once (the two language versions named different hosting providers). **Any
factual change** (host, data controller, address, legal basis) must be carried over to **both**
language versions. When unsure what's actually current (e.g. the real hosting provider), treat
the deployment workflow (`.github/workflows/main.yml`) as the source of truth rather than
guessing.

## Content Security Policy

The CSP is a `<meta http-equiv="Content-Security-Policy">` tag in
`_src/_includes/templates/header.njk` (GitHub Pages doesn't let you set custom HTTP headers).
`script-src` is just `'self'` — there is deliberately no inline `<script>` and no inline event
handler attribute (`onload="..."`, `onclick="..."`, etc.) anywhere in the templates.

That's not a style preference: a hash or nonce in `script-src` only covers `<script>` elements,
never inline event-handler attributes on other tags, and inline-script hashing via a `<meta>`
CSP has turned out to be unreliable across browsers in practice (it broke CSS loading in
production once already — Safari refused to run a `<script>` block whose hash matched the CSP
directive exactly). The site currently ships **no client-side JavaScript at all**. If you add
any, put it in an external, same-origin file under `_src/assets/js/` (with a passthrough-copy
entry in `.eleventy.js`) and reference it with `<script src="...">`, so `'self'` covers it
unconditionally — don't reach for an inline `<script>` or a hash to make it work.

## Fonts

Fonts are self-hosted as WOFF2 files under `_src/assets/fonts/` (see
`_src/assets/css/_fonts.scss`), not embedded as base64 in the CSS — that would needlessly bloat
`app.css`. Add new fonts as files plus a passthrough-copy entry in `.eleventy.js`, not inline.
`_src/_includes/templates/header.njk` preloads the heading font and uses `font-display: optional`
rather than `swap`, so a slow font fetch never causes a layout shift after text has already
rendered in the fallback font — it either shows up in time or the fallback stays for that visit.

## What's deliberately missing

No cookie banner, no tracking, no JS framework, no forms — the privacy policy explicitly
describes the site this way. Suggestions that would change that (analytics, a contact form with
a backend, a client-side framework) are a deliberate break from the current approach and should
be discussed first, not just added.
