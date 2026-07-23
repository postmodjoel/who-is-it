import { expect, test } from "@playwright/test";

const publicPages = [
  {
    path: "/",
    ready: async (page) => {
      await expect(page.locator(".ts-letplay")).toBeVisible();
    }
  },
  {
    path: "/labs/",
    ready: async (page) => {
      await expect(page.locator(".lab-card")).toHaveCount(8);
    }
  },
  {
    path: "/labs/face-studio.html",
    ready: async (page) => {
      await expect(page.locator("#resultCount")).not.toHaveText("0 faces");
      expect(await page.locator("#faceGrid img").count()).toBeGreaterThan(0);
    }
  },
  {
    path: "/labs/clothing-lab.html",
    ready: async (page) => {
      expect(await page.locator("#comparisonGrid img").count()).toBeGreaterThan(0);
    }
  },
  {
    path: "/labs/hair-studio.html",
    ready: async (page) => {
      expect(await page.locator("#comboStage img").count()).toBeGreaterThan(0);
    }
  },
  {
    path: "/labs/hair-compositor-lab.html",
    ready: async (page) => {
      expect(await page.locator("#baselineGrid img").count()).toBeGreaterThan(0);
    }
  },
  {
    path: "/labs/genetics-lab.html",
    ready: async (page) => {
      expect(await page.locator("#draftBoard img").count()).toBeGreaterThan(0);
    }
  },
  {
    path: "/labs/prompt-studio.html",
    ready: async (page) => {
      expect(await page.locator(".row").count()).toBeGreaterThan(0);
    }
  },
  {
    path: "/labs/compare.html",
    ready: async (page) => {
      await expect(page.locator("#grid .cell")).toHaveCount(24);
      await expect(page.locator(".ref-placeholder")).toHaveCount(24);
    }
  },
  {
    path: "/labs/audit-v2-dashboard.html",
    ready: async (page) => {
      await expect(page.locator("#list .card")).toHaveCount(48);
    }
  },
  {
    path: "/score-health-dashboard.html",
    allowMissing: ["/test-results/groupthink-score-health/report.json"],
    ready: async (page) => {
      const rendered = await page.locator(".headline, .miss").count();
      expect(rendered).toBe(1);
    }
  },
  {
    path: "/sim-range-review.html",
    ready: async (page) => {
      await expect(page.locator("#simRangeGrid .range-card")).toHaveCount(30);
    }
  }
];

for (const entry of publicPages) {
  test(`${entry.path} loads without broken resources or runtime errors`, async ({ page }) => {
    const failures = [];
    page.on("pageerror", (error) => failures.push(`page error: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") failures.push(`console error: ${message.text()}`);
    });
    page.on("response", (response) => {
      if (response.status() < 400) return;
      const url = response.url();
      if (entry.allowMissing?.some((suffix) => url.endsWith(suffix))) return;
      failures.push(`${response.status()} ${url}`);
    });
    page.on("requestfailed", (request) => {
      failures.push(`request failed: ${request.url()} (${request.failure()?.errorText || "unknown"})`);
    });

    const response = await page.goto(entry.path);
    expect(response?.ok(), `page request failed for ${entry.path}`).toBe(true);
    await entry.ready(page);
    expect(failures).toEqual([]);
  });
}
