import { expect, test } from "@playwright/test";

test.describe("guide checkout & protected downloads (test mode)", () => {
  test("guide page shows product details and test-mode labelling", async ({ page }) => {
    await page.goto("/guides/bali-tennis-escape-guide");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bali Tennis Escape Guide");
    await expect(page.getByText("$19").first()).toBeVisible();
    await expect(page.getByText("Test mode — no real payments")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Contents" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Preview pages" })).toBeVisible();
    expect(await page.content()).not.toContain("guides/bali-tennis-escape-guide.pdf"); // private path never exposed
  });

  test("coming-soon guides cannot be purchased", async ({ page }) => {
    await page.goto("/guides/alpine-clay-guide");
    await expect(page.getByRole("button", { name: /Buy now/ })).toHaveCount(0);
    await expect(page.getByText(/coming soon/i).first()).toBeVisible();
  });

  test("validates checkout input", async ({ page }) => {
    await page.goto("/guides/bali-tennis-escape-guide");
    await page.getByLabel("Email for your download link").fill("buyer@example.com");
    await page.getByRole("button", { name: /Buy now/ }).click();
    await expect(page.getByText("Please accept the terms to continue.")).toBeVisible();
  });

  test("failed test payment issues no download", async ({ page }) => {
    await page.goto("/guides/bali-tennis-escape-guide");
    await page.getByLabel("Email for your download link").fill("fail@example.com");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Buy now/ }).click();
    await expect(page).toHaveURL(/\/guides\/checkout\/test\?ref=test_/);
    await page.getByRole("button", { name: "Simulate failed payment" }).click();
    await expect(page.getByText("Payment failed (simulated).")).toBeVisible();
    await expect(page.getByTestId("purchase-status")).toHaveText("failed");
  });

  test("successful test payment delivers only the sample file via a protected link", async ({ page, request }) => {
    await page.goto("/guides/bali-tennis-escape-guide");
    await page.getByLabel("Email for your download link").fill("buyer@example.com");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: /Buy now/ }).click();
    await expect(page.getByText("Test mode — sandbox checkout")).toBeVisible();
    const checkoutUrl = page.url();
    await page.getByRole("button", { name: "Simulate successful test payment" }).click();
    await expect(page).toHaveURL(/\/downloads\/[A-Za-z0-9_-]{43}$/);
    await expect(page.getByTestId("test-mode-banner")).toBeVisible();
    const href = await page.getByTestId("download-link").getAttribute("href");
    const res = await request.get(href!);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("application/pdf");
    expect(res.headers()["content-disposition"]).toContain("TEST-SAMPLE");
    expect(res.headers()["cache-control"]).toContain("no-store");
    expect((await res.body()).toString("latin1")).toContain("TEST MODE SAMPLE");

    // The checkout can't be replayed.
    await page.goto(checkoutUrl);
    await expect(page.getByRole("button", { name: /Simulate successful/ })).toHaveCount(0);
  });

  test("download endpoint rejects unknown and malformed tokens; private files are not public", async ({ request }) => {
    expect((await request.get(`/api/download/${"a".repeat(43)}`)).status()).toBe(404);
    expect((await request.get("/api/download/..%2F..%2F.env")).status()).toBe(404);
    expect((await request.get("/private/guides/bali-tennis-escape-guide.pdf")).status()).toBe(404);
    expect((await request.get("/guides/bali-tennis-escape-guide.pdf")).status()).toBe(404);
  });

  test("test checkout page refuses invalid references", async ({ request }) => {
    expect((await request.get("/guides/checkout/test?ref=test_" + "0".repeat(24))).status()).toBe(404);
  });

  test("stripe webhook is unavailable when Stripe isn't configured", async ({ request }) => {
    expect((await request.post("/api/webhooks/stripe", { data: "{}" })).status()).toBe(503);
  });
});
