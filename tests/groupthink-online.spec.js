import { expect, test } from "@playwright/test";

test.describe("WHO? DO YOU THINK? online", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "online transport runs once on desktop");
  });
  test.describe.configure({ mode: "serial" });
  test.setTimeout(120_000);

  async function openOnlinePicker(page) {
    await page.goto("/");
    await page.evaluate(() => { try { localStorage.removeItem("whoisit_game_v1"); } catch (e) { /* fine */ } });
    await page.reload();
    if (await page.locator(".ts-letplay").count()) await page.locator(".ts-letplay").click();
    // Focus carousel: recentre the off-centre card, then the centred card launches.
    const gtCard = page.locator('.ts-ruleset[data-ruleset="groupthink"]');
    await gtCard.click();
    await expect(gtCard).toHaveClass(/is-focus/);
    await gtCard.click();
    await page.locator(".ts-online").click();
  }

  async function hostRoom(page, name) {
    await openOnlinePicker(page);
    await page.locator(".ts-name-input").fill(name);
    await page.locator(".ts-host").click();
    await expect(page.locator(".lobby-screen")).toBeVisible();
    return page.evaluate(() => state.roomCode);
  }

  async function joinRoom(page, name, code) {
    await openOnlinePicker(page);
    await page.locator(".ts-name-input").fill(name);
    await page.locator(".ts-showjoin").click();
    await page.locator(".ts-join-input").fill(code);
    await page.locator(".ts-join-go").click();
  }

  async function pickThree(page) {
    const cards = page.locator("#characterBoard [data-id]");
    for (let i = 0; i < 3; i += 1) await cards.nth(i).click();
    await expect(page.locator("#swapSeatButton")).toBeEnabled();
    await page.locator("#swapSeatButton").click();
  }

  async function saveFirst(page) {
    const candidate = page.locator(".gt-save-face").first();
    await expect(candidate).toBeVisible();
    await candidate.click();
    await page.locator(".gt-save-lock").click();
  }

  async function tripleRefresh(page, phase) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await page.waitForTimeout(650);
      await page.reload();
      await expect.poll(() => page.evaluate(() => state.groupthink?.phase)).toBe(phase);
      await expect.poll(() => page.evaluate(() => state.netStatus)).toBe("open");
    }
  }

  test("parallel ballots converge and a guest cannot forge host control", async ({ context }) => {
    const host = await context.newPage();
    const code = await hostRoom(host, "Hera");
    const guest = await context.newPage();
    await joinRoom(guest, "Ares", code);
    await expect(host.locator(".lobby-player.here")).toHaveCount(2);
    await host.evaluate(() => { state.settings.startModeId = "habbo"; });
    await host.locator(".lobby-start").click();
    await expect(host.locator("#characterBoard [data-id]")).toHaveCount(30);
    await expect(guest.locator("#characterBoard [data-id]")).toHaveCount(30);
    await expect.poll(() => Promise.all([host, guest].map((page) => page.evaluate(() => ({ effect: state.groupthink.effectId, mystery: state.global.mystery }))))).toEqual([
      { effect: null, mystery: null },
      { effect: null, mystery: null }
    ]);

    await guest.evaluate(() => { netSend("mode", { id: "heads-only" }); });
    await expect(host.locator("#characterBoard .heads-layer, #characterBoard .habbo-room")).toHaveCount(0);

    const prompt = await host.locator("#questionPrompt").innerText();
    await guest.evaluate(() => {
      const next = window.GameData.groupthinkPrompts.base.find((item) => item.id !== state.groupthink.promptId);
      netSend("gt-prompt", { roundIndex: state.groupthink.roundIndex, promptId: next.id, revision: state.groupthink.revision + 100 });
    });
    await expect(host.locator("#questionPrompt")).toHaveText(prompt);

    await pickThree(host);
    await expect.poll(() => guest.evaluate(() => state.groupthink.locked[0])).toBe(true);
    await pickThree(guest);
    await expect(host.locator(".gt-sync-result")).toContainText("+6", { timeout: 10_000 });
    await expect(guest.locator(".gt-sync-result")).toContainText("+6", { timeout: 10_000 });
    const revisions = await Promise.all([host, guest].map((page) => page.evaluate(() => state.groupthink.revision)));
    expect(revisions[0]).toBe(revisions[1]);
  });

  test("the host can continue a round after a confirmed disconnect", async ({ context }) => {
    const host = await context.newPage();
    const code = await hostRoom(host, "Hera");
    const guest = await context.newPage();
    await joinRoom(guest, "Ares", code);
    await expect(host.locator(".lobby-player.here")).toHaveCount(2);
    await host.locator(".lobby-start").click();
    await expect(host.locator("#characterBoard [data-id]")).toHaveCount(30);
    await expect(guest.locator("#characterBoard [data-id]")).toHaveCount(30);

    await pickThree(host);
    const guestId = await guest.evaluate(() => state.clientId);
    await guest.close();
    await host.evaluate((id) => peerGone(netPeers.get(id), "dropped"), guestId);
    await expect(host.locator(".gt-skip-seat")).toBeVisible();
    await host.locator(".gt-skip-seat").click();
    await expect(host.locator(".gt-results")).toBeVisible({ timeout: 10_000 });
    await expect(host.locator(".gt-sync-result")).toContainText("PLAYER SKIPPED · NO SCORE");
  });

  test("a replacement host rebuilds locked ballots before continuing", async ({ context }) => {
    const host = await context.newPage();
    const code = await hostRoom(host, "Hera");
    const guest1 = await context.newPage();
    const guest2 = await context.newPage();
    await joinRoom(guest1, "Ares", code);
    await joinRoom(guest2, "Zeus", code);
    await expect(host.locator(".lobby-player.here")).toHaveCount(3);
    await host.locator(".lobby-start").click();
    await Promise.all([host, guest1, guest2].map((page) => expect(page.locator("#characterBoard [data-id]")).toHaveCount(30)));

    await Promise.all([pickThree(guest1), pickThree(guest2)]);
    await expect.poll(() => guest1.evaluate(() => state.groupthink.locked.filter(Boolean).length)).toBe(2);
    const hostId = await host.evaluate(() => state.clientId);
    await host.close();
    await guest1.evaluate((id) => {
      const peer = netPeers.get(id);
      peerGone(peer, "dropped");
      if (peer) peer.lastSeen = Date.now() - 31_000;
      maybeOfferHostTakeover();
    }, hostId);
    await expect(guest1.locator(".host-takeover")).toBeVisible();
    await guest1.locator(".host-takeover .ht-claim").click();

    await expect.poll(() => guest1.evaluate(() => state.groupthink.locked.filter(Boolean).length)).toBe(2);
    await expect(guest1.locator(".gt-skip-seat")).toBeVisible();
    await guest1.locator(".gt-skip-seat").click();
    await expect(guest1.locator(".gt-results")).toBeVisible({ timeout: 10_000 });
    await expect(guest2.locator(".gt-results")).toBeVisible({ timeout: 10_000 });
    const states = await Promise.all([guest1, guest2].map((page) => page.evaluate(() => ({ revision: state.groupthink.revision, skipped: state.groupthink.skipped.slice(), phase: state.groupthink.phase }))));
    expect(states[0]).toEqual(states[1]);
    expect(states[0].skipped).toEqual([true, false, false]);
    expect(states[0].phase).toBe("saving");

    // A client that missed the last authoritative packets must accept a newer same-game snapshot.
    await guest2.evaluate(() => {
      state.groupthink.revision = Math.max(0, state.groupthink.revision - 2);
      netSend("hello", { pname: state.pname });
    });
    await expect.poll(() => guest2.evaluate(() => state.groupthink.revision)).toBe(states[0].revision);
  });

  test("host refreshes preserve selection, survivor voting and revealed results", async ({ context }) => {
    const host = await context.newPage();
    const code = await hostRoom(host, "Hera");
    const guest = await context.newPage();
    await joinRoom(guest, "Ares", code);
    await expect(host.locator(".lobby-player.here")).toHaveCount(2);
    await host.locator(".lobby-start").click();
    await Promise.all([host, guest].map((page) => expect(page.locator("#characterBoard [data-id]")).toHaveCount(30)));

    const hostIdentity = await host.evaluate(() => ({ clientId: state.clientId, seat: state.mySeat }));
    await tripleRefresh(host, "selecting");
    await expect.poll(() => host.evaluate(() => ({ clientId: state.clientId, seat: state.mySeat }))).toEqual(hostIdentity);

    await Promise.all([pickThree(host), pickThree(guest)]);
    await expect.poll(() => host.evaluate(() => state.groupthink.phase)).toBe("saving");
    await tripleRefresh(host, "saving");
    await expect.poll(() => guest.evaluate(() => state.groupthink.phase)).toBe("saving");

    await Promise.all([saveFirst(host), saveFirst(guest)]);
    await expect.poll(() => host.evaluate(() => state.groupthink.phase)).toBe("results");
    const revealed = await host.evaluate(() => ({
      revision: state.groupthink.revision,
      board: state.board.map((character) => character.id),
      scores: state.groupthink.scores.slice(),
      removed: state.groupthink.removed.slice()
    }));
    await tripleRefresh(host, "results");
    await expect.poll(() => host.evaluate(() => ({
      revision: state.groupthink.revision,
      board: state.board.map((character) => character.id),
      scores: state.groupthink.scores.slice(),
      removed: state.groupthink.removed.slice()
    }))).toEqual(revealed);
  });

  test("an unfinished survivor voter can be skipped without duplicating score", async ({ context }) => {
    const host = await context.newPage();
    const code = await hostRoom(host, "Hera");
    const guest = await context.newPage();
    await joinRoom(guest, "Ares", code);
    await expect(host.locator(".lobby-player.here")).toHaveCount(2);
    await host.locator(".lobby-start").click();
    await Promise.all([host, guest].map(pickThree));
    await expect.poll(() => host.evaluate(() => state.groupthink.phase)).toBe("saving");

    await saveFirst(host);
    const scoresBefore = await host.evaluate(() => state.groupthink.scores.slice());
    const guestId = await guest.evaluate(() => state.clientId);
    await guest.close();
    await host.evaluate((id) => peerGone(netPeers.get(id), "dropped", id), guestId);
    await expect(host.locator(".gt-save-skip")).toBeVisible();
    await host.locator(".gt-save-skip").click();
    await expect.poll(() => host.evaluate(() => state.groupthink.phase)).toBe("results");
    await expect.poll(() => host.evaluate(() => state.groupthink.scores.slice())).toEqual(scoresBefore);
    expect(await host.evaluate(() => state.groupthink.history)).toHaveLength(1);
  });

  test("a real twelve-page room converges without duplicate seats", async ({ context }) => {
    test.skip(process.env.GT_EXHAUSTIVE !== "1", "12-page fault coverage is release-only");
    test.setTimeout(360_000);
    const host = await context.newPage();
    const code = await hostRoom(host, "Seat 1");
    const pages = [host];
    for (let seat = 2; seat <= 12; seat += 1) {
      const page = await context.newPage();
      pages.push(page);
      await joinRoom(page, `Seat ${seat}`, code);
      await expect(host.locator(".lobby-player.here")).toHaveCount(seat);
    }
    await host.locator(".lobby-start").click();
    await Promise.all(pages.map((page) => expect(page.locator("#characterBoard [data-id]")).toHaveCount(30)));
    const seats = await Promise.all(pages.map((page) => page.evaluate(() => ({ clientId: state.clientId, seat: state.mySeat, roster: state.roster.length }))));
    expect(new Set(seats.map((seat) => seat.clientId)).size).toBe(12);
    expect(new Set(seats.map((seat) => seat.seat)).size).toBe(12);
    expect(seats.every((seat) => seat.roster === 12)).toBe(true);

    await Promise.all(pages.map(pickThree));
    await expect.poll(async () => {
      const snapshots = await Promise.all(pages.map((page) => page.evaluate(() => ({
        phase: state.groupthink.phase,
        revision: state.groupthink.revision,
        scores: state.groupthink.scores.slice()
      }))));
      return snapshots.every((snapshot) => JSON.stringify(snapshot) === JSON.stringify(snapshots[0]));
    }).toBe(true);
  });
});
