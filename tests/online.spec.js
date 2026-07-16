import { expect, test } from "@playwright/test";

// Multi-tab online smoke: pages inside ONE Playwright context share an origin + process, so the
// game's BroadcastChannel transport works exactly like real same-browser tabs. clientIds live in
// sessionStorage (per tab), so every page is a distinct player.
// Runs once, on the desktop project - the transport has no viewport-specific behaviour.
test.describe("online rooms", () => {
  test.beforeEach(({ browserName }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "transport smoke runs once, on desktop");
  });
  test.describe.configure({ mode: "serial" });
  test.setTimeout(120_000);

  async function openTitle(page) {
    await page.goto("/");
    // These tabs share ONE BrowserContext (so BroadcastChannel works), which also shares localStorage.
    // A refresh now auto-resumes any saved game - so a guest tab would inherit the host's save. Real
    // players are on separate devices; here we clear the leaked save to get a clean title.
    await page.evaluate(() => {
      try {
        localStorage.removeItem("whoisit_game_v1");
        localStorage.setItem("whoisit_manifesto_v1", "1");
        localStorage.setItem("whoisit_onboarded_v1", "1");
      } catch (e) { /* fine */ }
    });
    await page.reload();
    await page.evaluate(() => {
      document.querySelector(".title-screen")?.remove();
      document.querySelector(".lobby-screen")?.remove();
      showTitleScreen();
    });
    if (await page.locator(".ts-letplay").count()) await page.locator(".ts-letplay").click();
    await page.locator('.ts-ruleset[data-ruleset="whoisit"]').click();
    await expect(page.locator(".ts-local")).toBeVisible();
  }
  async function hostRoom(page, name) {
    await openTitle(page);
    await page.locator(".ts-online").click();
    await page.locator(".ts-name-input").fill(name);
    await page.locator(".ts-host").click();
    await expect(page.locator(".lobby-screen")).toBeVisible();
    return page.evaluate(() => state.roomCode);
  }
  async function joinRoomByCode(page, name, code) {
    await openTitle(page);
    await page.locator(".ts-online").click();
    await page.locator(".ts-name-input").fill(name);
    await page.locator(".ts-showjoin").click();
    await page.locator(".ts-join-input").fill(code);
    await page.locator(".ts-join-go").click();
  }
  const clearOverlays = (page) => page.evaluate(() => {
    document.querySelectorAll(".dimension-warp, .team-reveal, .round-reveal, .lobby-screen, .title-screen, .manifesto-card, .onboard-tips, .forecast-card").forEach((el) => el.remove());
  });
  const gameInfo = (page) => page.evaluate(() => ({
    salt: state.gameSalt,
    playMode: state.playMode,
    rosterLen: (state.roster || []).length,
    sides: (state.roster || []).map((r) => r.side),
    seats: (state.players || []).length,
    secrets: (state.players || []).map((p) => p.secretId),
    mySeat: state.mySeat,
    boardLen: state.board.length
  }));

  test("team mode: pre-start joins, start, mid-game join, elimination routing", async ({ context }) => {
    const host = await context.newPage();
    await host.goto("/");
    await host.evaluate(() => localStorage.clear());   // one shared wipe for the whole context
    const code = await hostRoom(host, "Hera");

    const g1 = await context.newPage();
    const g2 = await context.newPage();
    await joinRoomByCode(g1, "Ares", code);
    await joinRoomByCode(g2, "Zeus", code);
    await expect(host.locator(".lobby-player.here")).toHaveCount(3);
    await expect(g2.locator(".lobby-player.here")).toHaveCount(3);

    await host.locator(".lobby-start").click();
    for (const page of [host, g1, g2]) {
      await expect(page.locator("#characterBoard [data-id]").first()).toBeVisible({ timeout: 15_000 });
    }
    await Promise.all([host, g1, g2].map(clearOverlays));
    const [hi, i1, i2] = await Promise.all([host, g1, g2].map(gameInfo));
    expect(hi.playMode).toBe("team");
    expect(i1.salt).toBe(hi.salt);
    expect(i2.salt).toBe(hi.salt);
    expect(hi.rosterLen).toBe(3);
    expect(hi.seats).toBe(2);                          // team mode keeps the two-side engine
    const split = hi.sides.filter((s) => s === 0).length;
    expect([1, 2]).toContain(split);                   // 2v1, either way around

    // Mid-game settings edits should not redeal the board immediately; they sync as future-round state.
    await host.locator("#setupButton").click();
    await expect(host.locator("#setupDialog")).toBeVisible();
    await host.locator('.mode-policy-chip[data-policy="custom"]').click();
    const firstMode = host.locator('#settingModes .mode-check:not([disabled])').first();
    await firstMode.uncheck();
    await host.locator("#saveSetupButton").click();
    await expect.poll(() => host.evaluate(() => state.gameSalt), { timeout: 8_000 }).toBe(hi.salt);
    await expect.poll(() => g1.evaluate(() => state.settings.modePolicy), { timeout: 8_000 }).toBe("custom");
    const [hostAllowed, guestAllowed] = await Promise.all([
      host.evaluate(() => (state.settings.allowedModeIds || []).slice().sort()),
      g1.evaluate(() => (state.settings.allowedModeIds || []).slice().sort())
    ]);
    expect(hostAllowed.length).toBeGreaterThan(0);
    expect(guestAllowed).toEqual(hostAllowed);
    await expect(host.locator(".or-status")).toContainText(/friend|waiting|connected/i);
    await expect(host.locator(".or-status")).not.toContainText("🟢");
    await expect(host.locator(".or-status")).not.toContainText("🟡");
    await expect(host.locator(".or-status")).not.toContainText("🔴");
    await g1.locator("#setupButton").click();
    await expect(g1.locator("#setupDialog")).toBeVisible();
    await expect(g1.locator(".setup-mode-row")).toBeHidden();
    await expect(g1.locator(".mode-section")).toBeHidden();
    await g1.locator("#setupDialog .icon-button").click();

    // Mid-game join: a fourth player joins by code and adopts the live round.
    const late = await context.newPage();
    await joinRoomByCode(late, "Dion", code);
    await expect(late.locator("#characterBoard [data-id]").first()).toBeVisible({ timeout: 15_000 });
    await expect.poll(() => host.evaluate(() => (state.roster || []).length), { timeout: 10_000 }).toBe(4);
    const [h2, l2] = await Promise.all([host, late].map(gameInfo));
    expect(l2.salt).toBe(h2.salt);
    expect(h2.rosterLen).toBe(4);
    expect(h2.sides.filter((s) => s === 0).length).toBe(2);   // late joiner balanced the teams 2v2
    expect([0, 1]).toContain(l2.mySeat);

    // Elimination routing: the host crosses a card. A TEAMMATE's board mirrors it; an OPPONENT
    // only hears about it in the feed.
    await Promise.all([host, g1, g2, late].map(clearOverlays));
    const hostSide = await host.evaluate(() => state.mySeat || 0);
    const victim = await host.evaluate(() => {
      const id = state.board.find((c) => c.id !== currentPlayer().secretId).id;
      toggleEliminated(id);
      return id;
    });
    const pages = [g1, g2, late];
    const sides = await Promise.all(pages.map((p) => p.evaluate(() => state.mySeat || 0)));
    const mate = pages[sides.indexOf(hostSide)];
    const opp = pages[sides.findIndex((s) => s !== hostSide)];
    await expect.poll(() => mate.evaluate((id) => state.players[state.mySeat || 0].eliminated.has(id), victim), { timeout: 8_000 }).toBe(true);
    await expect.poll(() => opp.evaluate((id) => (state.opponentLog || []).some((e) => e.id === id), victim), { timeout: 8_000 }).toBe(true);
    const oppOwn = await opp.evaluate((id) => state.players[state.mySeat || 0].eliminated.has(id), victim);
    expect(oppOwn).toBe(false);

    // A newborn expands the shared board on both devices and keeps the added cast member aligned.
    const babyInfo = await host.evaluate(() => {
      const baby = makeBaby(state.board[0], state.board[1], false);
      state.board.push(baby);
      netAnnounceBaby(baby);
      scheduleSave();
      renderBoard();
      return { id: baby.id, len: state.board.length };
    });
    await expect.poll(() => g1.evaluate(() => state.board.length), { timeout: 8_000 }).toBe(babyInfo.len);
    await expect.poll(() => g1.evaluate(() => state.board[state.board.length - 1].id), { timeout: 8_000 }).toBe(babyInfo.id);

    // Heads Only formation changes are shared, not local-only.
    await host.evaluate(() => {
      applyMysteryEffect("heads-only");
      state.wheelPick = "heads-only";
      netSend("mode", { id: "heads-only" });
      render();
    });
    await expect.poll(() => g1.evaluate(() => state.global.mystery?.id), { timeout: 8_000 }).toBe("heads-only");
    await host.evaluate(() => {
      state.headsForm = 4;
      netSend("headsform", { form: 4 });
      renderBoard();
    });
    await expect.poll(() => g1.evaluate(() => state.headsForm), { timeout: 8_000 }).toBe(4);

    await Promise.all([host, g1, g2, late].map((p) => p.close()));
  });

  test("host-selected setup game mode starts the same mode for every online player", async ({ context }) => {
    const host = await context.newPage();
    await host.goto("/");
    await host.evaluate(() => localStorage.clear());
    await openTitle(host);
    await host.locator(".ts-online").click();
    await host.locator(".ts-name-input").fill("Hera");
    await host.locator('.ts-step-online .mode-policy-chip[data-policy="custom"]').click();
    const modeIds = await host.locator(".ts-step-online .mode-check:not([disabled])").evaluateAll((inputs) => inputs.map((input) => input.value));
    const chosenMode = modeIds[0];
    expect(chosenMode).toBeTruthy();
    for (const modeId of modeIds.slice(1)) await host.locator(`.ts-step-online .mode-check[value="${modeId}"]`).uncheck();
    await host.locator(".ts-host").click();
    await expect(host.locator(".lobby-screen")).toBeVisible();
    const code = await host.evaluate(() => state.roomCode);

    const guest = await context.newPage();
    await joinRoomByCode(guest, "Ares", code);
    await expect(host.locator(".lobby-player.here")).toHaveCount(2);
    await host.locator(".lobby-start").click();
    for (const page of [host, guest]) {
      await expect.poll(() => page.evaluate(() => state.global.mystery?.id || ""), { timeout: 15_000 }).toBe(chosenMode);
    }

    await Promise.all([host, guest].map((p) => p.close()));
  });

  test("solo mode: toggle in lobby, own seats/secrets, mid-game join keeps existing secrets", async ({ context }) => {
    const host = await context.newPage();
    await host.goto("/");
    await host.evaluate(() => localStorage.clear());
    const code = await hostRoom(host, "Kane");

    const g1 = await context.newPage();
    const g2 = await context.newPage();
    await joinRoomByCode(g1, "Lulu", code);
    await joinRoomByCode(g2, "Miro", code);
    await expect(host.locator(".lobby-player.here")).toHaveCount(3);

    // Host flips Team Mode OFF; guests see the mode line update (playMode broadcast).
    await host.locator(".lobby-team-mode-input").uncheck();
    await expect(g1.locator(".lobby-status")).toContainText("Team Mode OFF", { timeout: 8_000 });

    await host.locator(".lobby-start").click();
    for (const page of [host, g1, g2]) {
      await expect(page.locator("#characterBoard [data-id]").first()).toBeVisible({ timeout: 15_000 });
    }
    const infos = await Promise.all([host, g1, g2].map(gameInfo));
    for (const info of infos) {
      expect(info.playMode).toBe("solo");
      expect(info.seats).toBe(3);                       // one seat per player
      expect(new Set(info.secrets).size).toBe(3);       // three DISTINCT secrets
      expect(info.sides).toEqual([0, 1, 2]);
    }
    expect(new Set(infos.map((i) => i.mySeat)).size).toBe(3);   // everyone owns a different seat
    await expect(host.locator("body")).toHaveClass(/mode-solo/);

    // A guest's crossing lands on THEIR seat everywhere - nobody else's board changes.
    await Promise.all([host, g1, g2].map(clearOverlays));
    const g1Seat = await g1.evaluate(() => state.mySeat || 0);
    const victim = await g1.evaluate(() => {
      const id = state.board.find((c) => c.id !== currentPlayer().secretId).id;
      toggleEliminated(id);
      return id;
    });
    await expect.poll(() => host.evaluate(({ id, seat }) => state.players[seat].eliminated.has(id), { id: victim, seat: g1Seat }), { timeout: 8_000 }).toBe(true);
    const hostOwn = await host.evaluate((id) => state.players[state.mySeat || 0].eliminated.has(id), victim);
    expect(hostOwn).toBe(false);

    // Mid-game solo join: a fourth seat appears with a fresh unique secret; nobody's secret moves.
    const before = (await gameInfo(host)).secrets;
    const late = await context.newPage();
    await joinRoomByCode(late, "Nova", code);
    await expect(late.locator("#characterBoard [data-id]").first()).toBeVisible({ timeout: 15_000 });
    await expect.poll(() => host.evaluate(() => (state.players || []).length), { timeout: 10_000 }).toBe(4);
    const afterHost = await gameInfo(host);
    const afterLate = await gameInfo(late);
    expect(afterHost.secrets.slice(0, 3)).toEqual(before);      // existing secrets untouched
    expect(new Set(afterHost.secrets).size).toBe(4);            // newcomer's secret is unique
    expect(afterLate.salt).toBe(afterHost.salt);
    expect(afterLate.mySeat).toBe(3);

    await Promise.all([host, g1, g2, late].map((p) => p.close()));
  });
});
