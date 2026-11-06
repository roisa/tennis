import { expect, test } from "@playwright/test";

test.describe("homepage & navigation", () => {
  test("renders hero, all sections and has no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && !/tile\.openstreetmap|ERR_TUNNEL|net::ERR|Failed to load resource/.test(m.text()) && errors.push(m.text()));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Beyond\s*the court/i);
    for (const t of ["Where tennis meets the horizon.", "Choose your setting.", "Courts worth the journey.", "Stories from the baseline.", "Sleep steps from the court.", "Watch the places.", "Take COURTSCAPE with you.", "Your next tennis escape starts here."]) {
      await expect(page.getByRole("heading", { name: t })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: /Explore destinations/i })).toHaveAttribute("href", "/destinations");
    expect(errors).toEqual([]);
  });

  test("main navigation reaches every section", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    for (const [label, path, heading] of [
      ["Discover", "/discover", "Start with a feeling."],
      ["Destinations", "/destinations", "The world, court by court."],
      ["Courts", "/courts", "Find your court."],
      ["Stay & Play", "/stay-and-play", "Wake up. Walk to the court."],
      ["Journal", "/journal", "Stories from the baseline."],
      ["Guides", "/guides", "Plan the escape."],
      ["About", "/about", "Beyond the court."],
    ] as const) {
      await nav.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    }
  });

  test("unknown pages return 404", async ({ request }) => {
    for (const p of ["/courts/does-not-exist", "/journal/nope", "/destinations/nope", "/guides/nope"]) {
      expect((await request.get(p)).status(), p).toBe(404);
    }
  });

  test("SEO essentials are present", async ({ page, request }) => {
    await page.goto("/courts/raffles-bali");
    await expect(page).toHaveTitle(/Raffles Bali/);
    expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toBe("http://localhost:3200/courts/raffles-bali");
    expect(await page.locator('meta[property="og:title"]').getAttribute("content")).toContain("Raffles Bali");
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.some((j) => j.includes('"BreadcrumbList"'))).toBe(true);
    expect(ld.some((j) => j.includes('"aggregateRating"'))).toBe(false);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/courts/gstaad-palace");
    expect(sitemap).not.toContain("tennis-holidays-in-indonesia"); // draft article
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /admin");
  });
});

test.describe("court directory", () => {
  test("filters by surface via URL and UI, and clears", async ({ page }) => {
    await page.goto("/courts");
    await expect(page.getByTestId("result-count")).toContainText("13 venues");
    await page.getByLabel("Surface").selectOption("clay");
    await expect(page).toHaveURL(/surface=clay/);
    await expect(page.getByTestId("result-count")).toContainText("4 venues");
    await page.getByLabel("Country").selectOption("Switzerland");
    await expect(page.getByTestId("result-count")).toContainText("2 venues");
    await page.getByRole("link", { name: "Clear filters" }).click();
    await expect(page.getByTestId("result-count")).toContainText("13 venues");
  });

  test("text search and empty state", async ({ page }) => {
    await page.goto("/courts");
    await page.getByLabel("Search", { exact: true }).fill("Jimbaran");
    await page.getByLabel("Search", { exact: true }).press("Enter");
    await expect(page.getByTestId("result-count")).toContainText("2 venues");
    await page.goto("/courts?q=zzzz-no-match");
    await expect(page.getByText("No courts match — yet.")).toBeVisible();
  });

  test("experience, setting and venue-type filters work from links", async ({ page }) => {
    await page.goto("/courts?experience=mountain");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Mountain Courts");
    await page.goto("/courts?type=club");
    await expect(page.getByTestId("result-count")).toContainText("1 venue");
    await page.goto("/courts?sort=score");
    await expect(page.getByLabel("Sort", { exact: true })).toHaveValue("score");
  });

  test("map renders a marker per mapped venue", async ({ page }) => {
    await page.goto("/courts?destination=bali");
    await expect(page.locator(".cs-pin")).toHaveCount(5); // Kula Mani has no confirmed location
  });
});

test.describe("venue page", () => {
  test("shows practical details, honest status and sources", async ({ page }) => {
    await page.goto("/courts/raffles-bali");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Raffles Bali");
    const court = page.getByTestId("court-row").first();
    await expect(court).toContainText("Clay");
    await expect(court).toContainText("Not confirmed");
    await expect(page.getByText("Not yet reviewed.")).toBeVisible();
    const panel = page.getByTestId("verification-panel");
    await expect(panel).toContainText("Sourced from public information");
    await expect(panel).toContainText("Not yet verified with venue");
    await expect(panel.getByRole("link", { name: /Raffles Bali \(official\)/ })).toHaveAttribute("href", /raffles\.com/);
    await expect(page.getByRole("link", { name: /Official website/ })).toHaveAttribute("href", "https://www.raffles.com/bali/");
  });
});

test.describe("forms", () => {
  test("newsletter validates and subscribes", async ({ page }) => {
    await page.goto("/");
    const form = page.locator("form").filter({ has: page.locator("#nl-home") });
    await form.getByPlaceholder("Your email address").fill("not-an-email");
    await form.getByRole("button", { name: "Subscribe" }).click();
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
    await form.getByPlaceholder("Your email address").fill("reader@example.com");
    await form.getByRole("button", { name: "Subscribe" }).click();
    await expect(page.getByText("Thank you — you're on the list.")).toBeVisible();
  });

  test("contact form validates fields", async ({ page }) => {
    await page.goto("/contact?topic=Partnerships");
    await expect(page.getByLabel("Topic")).toHaveValue("Partnerships");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Please tell us your name.")).toBeVisible();
    await page.getByLabel("Name", { exact: true }).fill("Ana");
    await page.getByLabel("Email", { exact: true }).fill("ana@example.com");
    await page.getByLabel("Message").fill("We'd love to partner on a court feature.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText(/Your message has reached/)).toBeVisible();
  });
});
