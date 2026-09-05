<div align="center">
 <h1>
    <a href="https://lune-js.com/integrations/astro">
      <img alt="Lune.js - Simple, declarative, and functional library for building reactive user interfaces." src="https://lune-js.com/text.svg" width="400">
    </a>
  </h1>
</div>

This [Astro integration](https://docs.astro.build/en/guides/integrations/) adds [Lune.js](https://github.com/lune-js/lune) to your project so that you can use Lune.js anywhere on your page.

## Installation

```sh
npm install @lune-js/astro lune-js
```

Register the integration in your Astro config:

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import lune from "@lune-js/astro";

export default defineConfig({
  integrations: [lune()]
});
```

## Usage

Write Lune directives directly in your markup — no `<script>` tag and no `createApp()` call. The integration boots a single app per page and mounts it to every top-level `lu-scope`.

```astro
---
// src/pages/index.astro
---

<html>
  <head>
    <title>Lune 🌙 x Astro 🚀</title>
  </head>
  <body>
    <div lu-scope="{ count: 1 }">
      <p lu-text="count"></p>
      <button @click="count++">increment</button>
      <button @click="count--">decrement</button>
    </div>
  </body>
</html>
```

> [!NOTE]
> Astro's template syntax claims single braces, so `{{ }}` interpolation does not work inside `.astro` files. Use `lu-text`, or set custom [`$delimiters`](#data) that Astro leaves alone.

## Options

### `entrypoint`

Point `entrypoint` at a module that configures Lune before it mounts.

```js
// astro.config.mjs
export default defineConfig({
  integrations: [lune({ entrypoint: "/src/entrypoint" })]
});
```

The path may be a root-relative import specifier (`/src/entrypoint`) or relative to your project root (`./src/entrypoint`). The module may provide either or both of the exports below; if it provides neither, the integration warns in development and mounts an unmodified app.

#### `data`

A `data` export is passed straight to `createApp()`, becoming the app's **root scope**. Every `lu-scope` on the page inherits from it, which makes it the place for shared scope factories and for options Lune reads at creation time, such as `$delimiters`.

```ts
// src/entrypoint.ts
export const data = {
  $delimiters: ["[[", "]]"],
  Counter: (start = 0) => ({
    count: start,
    get double() {
      return this.count * 2;
    },
    increment() {
      this.count++;
    }
  })
};
```

```astro
<div lu-scope="Counter(5)">
  <p>[[ count ]]</p>
  <p lu-text="double"></p>
  <button @click="increment">increment</button>
</div>
```

Because this object is a real module export rather than serialized config, it can hold methods and getters — not just JSON. Custom `$delimiters` are worth calling out: they are read only at creation time, so this export is the only way to set them, and picking delimiters Astro ignores makes interpolation usable inside `.astro` files.

#### `default`

The default export receives the app instance after it is created but before it mounts. Use it to register custom directives and install plugins.

```ts
// src/entrypoint.ts
import type { App } from "lune-js";

export default (app: App) => {
  app.directive("focus", ({ el }) => el.focus());
};
```

## `window.Lune`

The integration exposes `window.Lune` as an escape hatch for inline scripts, carrying `reactive`, `effect`, `nextTick`, and `createApp`.

`window.Lune.createApp()` is **not** Lune's bare `createApp` — it is the integration's, so any app you create from it gets the same `data` and customizations as the one the integration mounts for you. Anything you pass takes precedence over the entrypoint's `data`:

```js
window.Lune.createApp({ user }).mount(el);
```

That matters with Astro's [`<ClientRouter />`](https://docs.astro.build/en/guides/view-transitions/). The integration mounts on `DOMContentLoaded`, which does not fire on client-side navigations, so re-mount on `astro:after-swap` and the new app keeps your entrypoint:

```astro
<script>
  if (!window.__luneRemount) {
    window.__luneRemount = true;
    document.addEventListener("astro:after-swap", () => window.Lune.createApp().mount());
  }
</script>
```

The guard matters: listeners on `document` survive swaps, so registering unconditionally would stack a listener on every navigation.

## Documentation

Full guide: [lune-js.com/integrations/astro](https://lune-js.com/integrations/astro)

## License

[MIT](./LICENSE)
