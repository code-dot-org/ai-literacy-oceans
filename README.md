# ai-literacy-oceans

A self-contained, embeddable web app that sequences the five interactive modes of the [AI for Oceans](https://studio.code.org/s/oceans) lab for the EU AI Literacy Framework.

## Embedding

```html
<!--
  The iframe content = progress bar (static height) + 16:9 canvas stacked.
  Set width on the iframe and let JS measure the inner content height so the
  canvas is always an exact 16:9 rectangle with no scroll or overlap.
-->
<iframe
  id="oceans"
  src="https://code-dot-org.github.io/ai-literacy-oceans/"
  style="width:100%; border:none; display:block;"
  allow="microphone"
  title="AI for Oceans">
</iframe>
<script>
  const f = document.getElementById('oceans');
  f.addEventListener('load', () => {
    const sync = () => {
      f.style.height = f.contentDocument.documentElement.scrollHeight + 'px';
    };
    sync();
    new ResizeObserver(sync).observe(f.contentDocument.documentElement);
  });
</script>
```

**Why not `aspect-ratio: 16/9`?** The iframe is taller than 16:9 because the progress bar sits above the 16:9 canvas. The canvas itself is always 16:9; the bar adds fixed height on top.

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
