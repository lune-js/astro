import { test, expect } from "@playwright/test";

declare global {
  interface Window {
    Lune: {
      createApp: (data?: Record<string, unknown>) => { mount: (el?: Element) => unknown };
    };
  }
}

test.describe("The entrypoint `data` export", () => {
  test("puts scope factories on the root scope", async ({ page }) => {
    await page.goto("/data");

    const double = page.locator("#double");
    const incrementButton = page.locator("#increment");

    await expect(double).toHaveText("10");

    await incrementButton.click();
    await expect(double).toHaveText("12");
  });

  test("applies custom delimiters", async ({ page }) => {
    await page.goto("/data");

    const count = page.locator("#count");
    const incrementButton = page.locator("#increment");

    await expect(count).toHaveText("5");

    await incrementButton.click();
    await expect(count).toHaveText("6");
  });
});

test.describe("`window.Lune.createApp()`", () => {
  test("inherits the entrypoint's data and directives", async ({ page }) => {
    await page.goto("/remount");

    const messagePromise = page.waitForEvent("console", (msg) => msg.text().includes("remounted"));

    await page.evaluate(() => {
      const host = document.getElementById("host")!;
      host.innerHTML = `<div lu-scope="Counter(2)" lu-log="remounted"><p id="remount-count" lu-text="count"></p></div>`;
      window.Lune.createApp().mount(host);
    });

    await expect(page.locator("#remount-count")).toHaveText("2");

    const message = await messagePromise;
    expect(message.text()).toContain("remounted");
  });

  test("merges data passed by the caller over the entrypoint's", async ({ page }) => {
    await page.goto("/remount");

    await page.evaluate(() => {
      const host = document.getElementById("host")!;
      host.innerHTML = `<div lu-scope="Counter(1)"><p id="override-count" lu-text="count"></p><p id="override-label" lu-text="label"></p></div>`;
      window.Lune.createApp({ label: "from caller" }).mount(host);
    });

    await expect(page.locator("#override-count")).toHaveText("1");
    await expect(page.locator("#override-label")).toHaveText("from caller");
  });
});
