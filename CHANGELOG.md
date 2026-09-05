# @lune-js/astro

## [1.0.0] - 2026-09-05

### Changed

- Support passing an object to `createApp()` through the entrypoint.
  - The `entrypoint` module may now provide a `data` export, which is passed to `createApp()` and becomes the app's root scope.
  - `window.Lune.createApp()` is now the integration's factory rather than Lune's bare one.
    - Apps created from the escape hatch inherit the same `data` and customizations.
    - Data passed by the caller takes precedence over the entrypoint's.
  - An entrypoint exporting only `data` and no default function is valid and does not warn in development.

## [0.2.1] - 2026-09-04

### Fixed

- Removes stray `console.log(entrypoint)` in `configResolved`.

## [0.2.0] - 2026-08-05

### Added

- Bump `lune-js` peer dependency.

## [0.1.1] - 2026-08-02

### Fixed

- Fix package `peerDependencies` when versioning with ci by removing `bun update`.

## [0.1.0] - 2026-08-02

### Added

- Initial release of Lune 🌙 x Astro 🚀
  This [Astro integration](https://docs.astro.build/en/guides/integrations/) adds [Lune.js](https://github.com/lune-js/lune) to your project so that you can use Lune.js anywhere on your page.
