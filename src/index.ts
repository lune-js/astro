import { resolve } from "node:path";
import type { AstroIntegration } from "astro";
import type { EnvironmentOptions, Plugin } from "vite";

const NAME = "@lune-js/astro";

interface Options {
  /**
   * You can extend Lune by setting this option to a root-relative import specifier (for example, `entrypoint: "/src/entrypoint"`).
   *
   * The module may provide either or both of the following exports:
   *
   * - A `data` object, which is passed to `createApp()`. It becomes the app's root scope, so it is the place for shared scope factories, and for options Lune reads at creation time such as `$delimiters`.
   * - A default export, which is a function that receives the app instance after it is created but before it mounts, allowing the use of custom directives, plugins and other customizations for advanced use cases.
   *
   * ```js
   * // astro.config.mjs
   * import { defineConfig } from "astro/config";
   * import lune from "@lune-js/astro";
   *
   * export default defineConfig({
   *   // ...
   *   integrations: [lune({ entrypoint: "/src/entrypoint" })],
   * });
   * ```
   *
   * ```js
   * // src/entrypoint.ts
   * import type { App } from "lune-js";
   * import i18nPlugin from "my-i18n-plugin";
   *
   * export const data = {
   *   $delimiters: ["[[", "]]"],
   *   Counter: (start = 0) => ({ count: start, increment() { this.count++ } })
   * };
   *
   * export default (app: App) => {
   *   app.use(i18nPlugin);
   * }
   * ```
   */
  entrypoint?: string;
}

function virtualEntrypoint(options?: Options): Plugin {
  const virtualModuleId = `virtual:${NAME}/entrypoint`;
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  let isBuild: boolean;
  let root: string;
  let entrypoint: string | undefined;

  return {
    name: `${NAME}/virtual-entrypoint`,
    config(_, { command }) {
      isBuild = command === "build";
    },
    configResolved(config) {
      root = config.root;
      if (options?.entrypoint) {
        entrypoint = options.entrypoint.startsWith(".") ? resolve(root, options.entrypoint) : options.entrypoint;
      }
    },
    resolveId: {
      filter: {
        id: new RegExp(`^${virtualModuleId}$`)
      },
      handler() {
        return resolvedVirtualModuleId;
      }
    },
    load: {
      filter: {
        id: new RegExp(`^${resolvedVirtualModuleId}$`)
      },
      handler() {
        // Without an entrypoint there is nothing to configure, so the app
        // factory is Lune's own `createApp` untouched.
        if (!entrypoint) {
          return `export { createApp } from "lune-js";`;
        }

        return `\
import { createApp as create } from "lune-js";
import * as mod from ${JSON.stringify(entrypoint)};

export const createApp = (data) => {
  const initialData = mod.data || data ? { ...mod.data, ...data } : undefined;
  const app = create(initialData);

  if (typeof mod.default === "function") {
    mod.default(app);
  }${
    isBuild
      ? ""
      : ` else if (!("data" in mod)) {
    console.warn("[${NAME}] entrypoint \`" + ${JSON.stringify(
      entrypoint
    )} + "\` does not export a default function or a \`data\` object.");
  }`
  }

  return app;
};`;
      }
    }
  };
}

function configEnvironmentPlugin(): Plugin {
  return {
    name: `${NAME}/config-environment`,
    configEnvironment(environmentName, _options) {
      const environmentOptions: EnvironmentOptions = {
        optimizeDeps: {}
      };

      if (environmentName === "client") {
        environmentOptions.optimizeDeps!.include = ["lune-js"];
      }

      return environmentOptions;
    }
  };
}

export default function createPlugin(options?: Options): AstroIntegration {
  return {
    name: NAME,
    hooks: {
      "astro:config:setup": ({ injectScript, updateConfig }) => {
        // This gets injected into the user's page, so the import will pull
        // from the project's version of Lune.js in their package.json.
        //
        // `createApp` from the virtual entrypoint replaces Lune's own on
        // `window.Lune`, so apps created from the escape hatch — after a
        // client-side navigation, for example — get the same `data` and
        // customizations as the one this script mounts.
        injectScript(
          "page",
          `import * as Lune from "lune-js";
import { createApp } from "virtual:${NAME}/entrypoint";
window.Lune = { ...Lune, createApp };
document.addEventListener("DOMContentLoaded", () => createApp().mount());`
        );
        updateConfig({
          vite: {
            plugins: [virtualEntrypoint(options), configEnvironmentPlugin()]
          }
        });
      }
    }
  };
}
