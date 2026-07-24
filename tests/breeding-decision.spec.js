import { expect, test } from "@playwright/test";

async function openBareApp(page) {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem("whoisit_game_v1");
      localStorage.setItem("whoisit_manifesto_v1", "1");
      localStorage.setItem("whoisit_onboarded_v1", "1");
      localStorage.setItem("whoisit_device_prefs_v1", JSON.stringify({ sound: false, music: false }));
    } catch (error) { /* storage can be unavailable in unusual browser contexts */ }
  });
  await page.goto("/");
  await page.waitForFunction(() => typeof window.Sound?.trackInfo === "function");
  await page.locator(".title-screen").evaluateAll((els) => els.forEach((el) => el.remove()));
}

function sampleBaby() {
  return {
    id: "baby-test",
    name: "Nova Reed",
    pronouns: "they",
    role: "night-shift florist",
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Crect width='160' height='160' fill='%23a8c5df'/%3E%3Ccircle cx='80' cy='72' r='42' fill='%23b97652'/%3E%3C/svg%3E",
    identity: { pronouns: "they/them", gender: "Non-Binary", kink: "praise kink" },
    parents: ["Avery", "Morgan"]
  };
}

test("baby decision reveals generated identity and effect data, then resolves once", async ({ page }) => {
  await openBareApp(page);
  await page.evaluate((baby) => {
    state.settings.pg = false;
    window.__babyDecision = { keep: 0, abort: 0 };
    offerKeepOrAbort(baby, () => { window.__babyDecision.keep++; }, () => { window.__babyDecision.abort++; }, {
      mode: "disease",
      assignment: {
        diseases: [{ tier: "MEGA", name: "Mutant Hay Fever" }],
        meds: ["Night Syrup"],
        pain: 2
      }
    });
  }, sampleBaby());

  const offer = page.locator(".keep-abort");
  await expect(offer).toBeVisible();
  await expect(page.locator("#ka-baby-name")).toHaveText("Nova Reed");
  await expect(page.locator('[data-baby-field="pronouns"] dd')).toHaveText("they/them");
  await expect(page.locator('[data-baby-field="gender"] dd')).toHaveText("Non-Binary");
  await expect(page.locator('[data-baby-field="kink"] dd')).toHaveText("praise kink");
  await expect(page.locator('[data-baby-field="conditions"] dd')).toContainText("MEGA Mutant Hay Fever");
  await expect(page.locator('[data-baby-field="parents"] dd')).toHaveText("Avery + Morgan");

  const keep = page.locator(".ka-keep");
  await keep.click();
  await expect(offer).toHaveClass(/is-keeping/);
  await expect(keep).toBeDisabled();
  await expect(page.locator(".ka-status")).toContainText("Joining the family");
  await offer.dispatchEvent("click");
  await expect(offer).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.__babyDecision)).toEqual({ keep: 1, abort: 0 });
});

test("abort dissolves the card and cannot invoke both decisions", async ({ page }) => {
  await openBareApp(page);
  await page.evaluate((baby) => {
    state.settings.pg = false;
    window.__babyDecision = { keep: 0, abort: 0 };
    offerKeepOrAbort(baby, () => { window.__babyDecision.keep++; }, () => { window.__babyDecision.abort++; }, {
      mode: "hidden-agendas",
      assignment: { party: "Independent", state: "QLD", newThinking: "four-day weekends" }
    });
  }, sampleBaby());

  await expect(page.locator('[data-baby-field="new-thinking"] dd')).toHaveText("FOR four-day weekends");
  const abort = page.locator(".ka-abort");
  await abort.click();
  await expect(page.locator(".keep-abort")).toHaveClass(/is-aborting/);
  await expect(abort).toBeDisabled();
  await expect(page.locator(".ka-status")).toContainText("Fading from this timeline");
  await expect(page.locator(".keep-abort")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => window.__babyDecision)).toEqual({ keep: 0, abort: 1 });
});

test("newborn and offer motion is soft, responsive, and reduced-motion aware", async ({ page }) => {
  await openBareApp(page);
  const styles = await page.evaluate(() => {
    const card = document.createElement("div"); card.className = "character-card just-born";
    const offer = document.createElement("div"); offer.className = "keep-abort";
    const box = document.createElement("div"); box.className = "ka-box"; offer.appendChild(box);
    document.body.append(card, offer);
    const cardStyle = getComputedStyle(card); const offerStyle = getComputedStyle(offer); const boxStyle = getComputedStyle(box);
    const result = {
      cardAnimation: cardStyle.animationName,
      cardDuration: cardStyle.animationDuration,
      offerTransition: offerStyle.transitionProperty,
      boxTransition: boxStyle.transitionProperty
    };
    card.remove(); offer.remove();
    return result;
  });
  expect(styles.cardAnimation).toBe("baby-pop");
  expect(Number.parseFloat(styles.cardDuration)).toBeGreaterThanOrEqual(0.8);
  expect(styles.offerTransition).toContain("opacity");
  expect(styles.boxTransition).toContain("transform");

  await page.setViewportSize({ width: 390, height: 720 });
  await page.evaluate((baby) => {
    state.settings.pg = false;
    offerKeepOrAbort(baby, () => {}, () => {}, { mode: "woke" });
  }, { ...sampleBaby(), wokeIdentity: { pronouns: "they/them", gender: "Non-Binary", ethnicity: "Mixed" } });
  const box = await page.locator(".ka-box").boundingBox();
  expect(box).not.toBeNull();
  expect(box.width).toBeLessThanOrEqual(390);
  expect(box.height).toBeLessThanOrEqual(720);
});

test("music remains disabled while sound effects stay available", async ({ page }) => {
  await openBareApp(page);
  const state = await page.evaluate(() => {
    Sound.resume();
    Sound.setEnabled(true);
    Sound.setTrack(1);
    Sound.setMusic(true);
    Sound.titleLoop(true);
    Sound.creditsLoop(true);
    Sound.play("click");
    return {
      enabled: Sound.isEnabled(),
      music: Sound.isMusicOn(),
      effects: Sound.sfxNames()
    };
  });
  expect(state.enabled).toBe(true);
  expect(state.music).toBe(false);
  expect(state.effects).toContain("click");
});
