---
"@lune-js/astro": major
---

Support passing an object to `createApp()` through the entrypoint.

- The `entrypoint` module may now provide a `data` export, which is passed to `createApp()` and becomes the app's root scope.
- `window.Lune.createApp()` is now the integration's factory rather than Lune's bare one.
  - Apps created from the escape hatch inherit the same `data` and customizations.
  - Data passed by the caller takes precedence over the entrypoint's.
- An entrypoint exporting only `data` and no default function is valid and does not warn in development.
