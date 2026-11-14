# Sunvolt Energy — Website Template

Solar & clean-energy landing page with a live savings calculator. Designed and built by **Sazzuiux**.
Built 1:1 from the Figma file "Sunvolt" (same colour variables, Lexend type scale and 12-column grid).

## Open it

No install, no build, no hosting needed.

1. Click **Code → Download ZIP** and unzip.
2. Double-click `index.html` — it opens in your browser.

> The Lexend font loads from Google Fonts, so keep internet on for the exact typeface.
> Offline it falls back to the system font.

## Free live link (optional)

**Settings → Pages → Source: Deploy from a branch → `main` / `root` → Save.**
After about a minute the site is live at `https://sazzuiux.github.io/sunvolt-website/`.

## What works

- **Savings calculator** — property type, monthly bill and roof-space sliders, sun exposure and add-ons update yearly savings, 25-year savings, payback, system size, CO₂ and the before/after bill bars live.
- **Hero quick check** — ZIP + bill + property type pre-fills the calculator and scrolls to it.
- **Case-study carousel** — auto-plays every 6 s with a progress dot. Pauses on hover; supports arrows, dots and swipe.
- **FAQ accordion**, **lead form** (validation + thank-you state), **newsletter**, **mobile menu**, **sticky nav**.

## Animations

- "Sunvolt Energy" watermark rises letter by letter out of the ocean (behind the turbines), then gently bobs like a wave.
- "Power Smarter, Live Greener." words blur in, with a lime underline drawing under "Greener."
- Partner logos scroll in an endless marquee.
- Every stat counts up when it scrolls into view.
- The floating "Chat with an expert" button slides in after the hero, with a pulsing ring and a wiggle.
- Sections fade up on scroll; cards and photos zoom gently on hover.
- All motion is switched off for visitors who set "reduce motion" in their system.

## Re-skin for a client

All colours live at the top of `css/styles.css` (`:root`), using the same names as the Figma variables
(`--bg-brand`, `--text-primary`, …). Change those, swap the images in `assets/img/`, and edit the text in `index.html`.

## Files

```
index.html        page markup
css/styles.css    tokens, layout, responsive rules, animations
js/main.js        calculator, carousel, counters, form, menu
assets/img/       photos exported from the Figma file (WebP)
```
