# ai-literacy-oceans

A self-contained, embeddable web app that sequences the five interactive modes of the [AI for Oceans](https://studio.code.org/s/oceans) lab for the EU AI Literacy Framework.

## Embedding

```html
<!-- Responsive wrapper: 16:9 canvas + 62px progress bar -->
<div style="position:relative; width:100%; padding-top:calc(56.25% + 62px);">
  <iframe
    src="https://code-dot-org.github.io/ai-literacy-oceans/"
    style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;"
    allow="microphone"
    title="AI for Oceans">
  </iframe>
</div>
```

### Contract

- **Self-contained**: no `postMessage`, no URL parameters, no completion signal. The host page owns all surrounding UI.
- **Locale auto-detection**: `navigator.language` is mapped to the nearest of the 24 official EU languages; English is the fallback. No in-app picker.
- **No network calls for translations**: EU strings are baked into the bundle.
- **TTS is best-effort**: only `en` and `it` have voice data; other EU locales fall back to browser voices or stay silent.

## Sequence

The app runs five lab modes in curriculum order, advancing on the lab's Continue callback:

```
fishvtrash → creaturesvtrashdemo → creaturesvtrash → short → long → play-again
```

After the final mode a "Play Again" button restarts from `fishvtrash`.

## Development

```bash
# Install (requires read:packages token for @code-dot-org scope)
npm ci

# Dev server
npm run dev

# Build
npm run build

# Preview the subpath build
npm run preview
```

### GitHub Packages auth

The `@code-dot-org/oceans-lab` package lives on GitHub Packages under the `code-dot-org` org. In CI the deploy workflow uses `GITHUB_TOKEN` (automatic, no secret needed). Locally you need a token with `read:packages`:

```bash
echo "//npm.pkg.github.com/:_authToken=YOUR_TOKEN" >> ~/.npmrc
```

## Testing

```bash
# Run e2e tests locally (starts dev server automatically)
npm run test:ui

# CI mode (used in the deploy workflow)
npm run test:ui:ci
```

## Translations

EU locale strings live in `i18n/<locale>.json`. They were generated from the `@code-dot-org/oceans-lab` English catalog (`@code-dot-org/oceans-lab/i18n`) and committed once. To regenerate after an English catalog update:

1. `npm show @code-dot-org/oceans-lab` — check the version.
2. Import the catalog: `import catalog from '@code-dot-org/oceans-lab/i18n'`.
3. Regenerate each locale JSON preserving `{var}` placeholders and ICU plural syntax.
4. Commit under `i18n/<locale>.json`.
