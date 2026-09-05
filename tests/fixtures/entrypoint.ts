import type { App } from "lune-js";

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

export default (app: App) => {
  app.use({
    install: (app) => {
      app.directive("log", ({ exp }) => {
        console.log(exp);
      });
    }
  });
};
