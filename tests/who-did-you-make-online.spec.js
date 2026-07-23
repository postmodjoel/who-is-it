import { expect, test } from "@playwright/test";

const relay = process.env.WDYM_RELAY || "";

test.describe("WHO? DID YOU MAKE? Live Build online", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "online transport runs once on desktop");
  });
  test.describe.configure({ mode: "serial" });
  test.setTimeout(120_000);

  async function openOnlinePicker(page) {
    const entry = relay ? `/?relay=${encodeURIComponent(relay)}` : "/";
    await page.goto(entry);
    await page.evaluate(() => {
      try {
        localStorage.removeItem("whoisit_game_v1");
        sessionStorage.removeItem("whoisit_online_game_v1");
        localStorage.setItem("whoisit_manifesto_v1", "1");
        localStorage.setItem("whoisit_onboarded_v1", "1");
      } catch (error) { /* storage may be blocked */ }
    });
    await page.reload();
    if (await page.locator(".ts-letplay").count()) await page.locator(".ts-letplay").click();
    // Focus carousel: recentre the off-centre card, then the centred card launches.
    const wdymCard = page.locator('.ts-ruleset[data-ruleset="whodidyoumake"]');
    await wdymCard.click();
    await expect(wdymCard).toHaveClass(/is-focus/);
    await wdymCard.click();
    await expect(page.locator(".ts-online")).toBeEnabled();
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

  async function openPart(page, donorId, part) {
    await page.locator(`.wdym-donor[data-donor="${donorId}"]`).click();
    await expect(page.locator(`.wdym-claim-part[data-part="${part}"]`)).toBeEnabled();
  }

  async function finishLiveRound(host, players) {
    for (let guard = 0; guard < 30; guard += 1) {
      if (await host.evaluate(() => state.whodidyoumake.phase !== "drafting")) break;
      for (const page of players) {
        if (await host.evaluate(() => state.whodidyoumake.phase !== "drafting")) break;
        const before = await host.evaluate(() => state.whodidyoumake.rounds[state.whodidyoumake.roundIndex].claims.length);
        // The relay has a real network hop. Wait until this client has applied the host's previous
        // revision (which also clears its pending-claim guard) before asking it to submit again.
        await expect.poll(() => page.evaluate(() => {
          const session = state.whodidyoumake;
          return session.rounds[session.roundIndex].claims.length;
        })).toBe(before);
        const moved = await page.evaluate(() => {
          const session = state.whodidyoumake;
          const round = session.rounds[session.roundIndex];
          const choice = MakeRules.legalLiveClaims(round, state.myRosterIndex)[0];
          if (!choice) return false;
          WhoDidYouMake.claimPart(choice.donorId, choice.part);
          return true;
        });
        if (moved) {
          await expect.poll(() => host.evaluate(() => {
            const session = state.whodidyoumake;
            return session.rounds[session.roundIndex].claims.length;
          })).toBeGreaterThan(before);
        }
      }
    }
    await expect.poll(() => host.evaluate(() => state.whodidyoumake.phase)).toBe("reveal");
  }

  test("simultaneous snips converge on one host-authoritative winner and survive refresh", async ({ context }) => {
    const host = await context.newPage();
    const code = await hostRoom(host, "Hera");
    const guest = await context.newPage();
    await joinRoom(guest, "Ares", code);
    await expect(host.locator(".lobby-player.here")).toHaveCount(2);
    await host.locator(".lobby-start").click();

    await Promise.all([host, guest].map(async (page) => {
      await expect(page.locator(".wdym-draft")).toBeVisible();
      await expect(page.locator(".wdym-live-reference img")).toHaveCount(2);
      await expect(page.locator(".wdym-handoff, .wdym-peek-hold")).toHaveCount(0);
      await expect(page.locator(".wdym-donor")).toHaveCount(18);
    }));

    const donorId = await host.evaluate(() => state.whodidyoumake.rounds[0].donors[0].id);
    await Promise.all([openPart(host, donorId, "mouth"), openPart(guest, donorId, "mouth")]);
    // Invoke both already-open controls in the same turn. A literal Playwright click waits for
    // stability, allowing the winner's render to detach the loser's button before its event fires.
    await Promise.all([
      host.evaluate((id) => WhoDidYouMake.claimPart(id, "mouth"), donorId),
      guest.evaluate((id) => WhoDidYouMake.claimPart(id, "mouth"), donorId)
    ]);

    await expect.poll(async () => Promise.all([host, guest].map((page) => page.evaluate(() => ({
      revision: state.whodidyoumake.revision,
      claims: state.whodidyoumake.rounds[0].claims.map(({ playerIndex, donorId, part }) => ({ playerIndex, donorId, part }))
    }))))).toEqual(expect.arrayContaining([
      expect.objectContaining({ claims: [expect.objectContaining({ donorId, part: "mouth" })] }),
      expect.objectContaining({ claims: [expect.objectContaining({ donorId, part: "mouth" })] })
    ]));

    const converged = await Promise.all([host, guest].map((page) => page.evaluate(() => JSON.stringify(state.whodidyoumake.rounds[0].claims))));
    expect(converged[0]).toBe(converged[1]);
    const owner = await host.evaluate(() => state.whodidyoumake.rounds[0].claims[0].playerIndex);
    expect([0, 1]).toContain(owner);
    await Promise.all([host, guest].map((page) => expect(page.locator(`.wdym-donor[data-donor="${donorId}"]`)).toHaveAttribute("data-removed-parts", "mouth")));

    await guest.waitForTimeout(700);
    const beforeRefresh = await guest.evaluate(() => ({ revision: state.whodidyoumake.revision, claims: state.whodidyoumake.rounds[0].claims }));
    await guest.reload();
    await expect(guest.locator(".wdym-live-reference img")).toHaveCount(2);
    await expect.poll(() => guest.evaluate(() => ({ revision: state.whodidyoumake.revision, claims: state.whodidyoumake.rounds[0].claims }))).toEqual(beforeRefresh);

    // Finish the live race with sequential legal requests. This verifies that simultaneous mode
    // has no hidden snake-turn dependency and that the first completed build earns its speed bonus.
    await finishLiveRound(host, [host, guest]);
    await Promise.all([host, guest].map((page) => expect(page.locator(".wdym-reveal")).toBeVisible()));
    const bonuses = await host.evaluate(() => state.whodidyoumake.rounds[0].results.players.map((result) => result.speedBonus).sort((a, b) => b - a));
    expect(bonuses).toEqual([10, 0]);
  });

  test("host authority, private references, late joins, reveal controls, and the next round stay synchronized", async ({ context }) => {
    const host = await context.newPage();
    const code = await hostRoom(host, "Hera");
    const guest = await context.newPage();
    await joinRoom(guest, "Ares", code);
    await expect(host.locator(".lobby-player.here")).toHaveCount(2);
    await host.locator(".lobby-start").click();
    await Promise.all([host, guest].map((page) => expect(page.locator(".wdym-draft")).toBeVisible()));

    const identities = await Promise.all([host, guest].map((page) => page.evaluate(() => ({
      index: state.myRosterIndex,
      target: document.querySelector('.wdym-live-reference img[alt="Your commission"]')?.getAttribute("src"),
      references: document.querySelectorAll(".wdym-live-reference img").length
    }))));
    expect(identities.map(({ index }) => index)).toEqual([0, 1]);
    expect(identities.map(({ references }) => references)).toEqual([2, 2]);
    expect(identities[0].target).not.toBe(identities[1].target);

    // A late player cannot acquire a seat after the shared donor slab is already live.
    const late = await context.newPage();
    await joinRoom(late, "Hermes", code);
    await expect(late.locator(".join-deadend")).toContainText("full", { timeout: 10_000 });
    await expect.poll(() => host.evaluate(() => state.roster.length)).toBe(2);
    await late.close();

    // The host derives ownership from the sender's client id. A guest-supplied playerIndex is ignored.
    const forgedChoice = await guest.evaluate(() => {
      const round = state.whodidyoumake.rounds[0];
      return MakeRules.legalLiveClaims(round, state.myRosterIndex)[0];
    });
    await guest.evaluate((choice) => netSend("wdym-claim-request", {
      for: netHostId(), requestId: "forged-owner", roundIndex: 0,
      donorId: choice.donorId, part: choice.part, playerIndex: 0
    }), forgedChoice);
    await expect.poll(() => host.evaluate(() => state.whodidyoumake.rounds[0].claims.length)).toBe(1);
    await expect.poll(() => host.evaluate(() => state.whodidyoumake.rounds[0].claims[0].playerIndex)).toBe(1);

    // A non-host cannot forge a newer authoritative session packet.
    const beforeForge = await host.evaluate(() => ({ revision: state.whodidyoumake.revision, roundCount: state.whodidyoumake.roundCount }));
    await guest.evaluate(() => {
      const fake = JSON.parse(JSON.stringify(state.whodidyoumake));
      fake.roundCount = 99;
      fake.revision += 100;
      netSend("wdym-state", { revision: fake.revision, whodidyoumake: fake });
    });
    await guest.waitForTimeout(250);
    await expect.poll(() => host.evaluate(() => ({ revision: state.whodidyoumake.revision, roundCount: state.whodidyoumake.roundCount }))).toEqual(beforeForge);

    await finishLiveRound(host, [host, guest]);
    await Promise.all([host, guest].map((page) => expect(page.locator(".wdym-reveal")).toBeVisible()));
    await expect(guest.locator(".wdym-next-reveal")).toHaveCount(0);
    const revealBefore = await guest.evaluate(() => state.whodidyoumake.revealIndex);
    await guest.evaluate(() => WhoDidYouMake.nextReveal());
    expect(await guest.evaluate(() => state.whodidyoumake.revealIndex)).toBe(revealBefore);

    await host.locator(".wdym-next-reveal").click();
    await expect.poll(() => guest.evaluate(() => state.whodidyoumake.revealIndex)).toBe(1);
    await host.locator(".wdym-next-reveal").click();
    await Promise.all([host, guest].map((page) => expect(page.locator(".wdym-score")).toBeVisible()));
    await expect(guest.locator(".wdym-next-round")).toHaveCount(0);

    await host.locator(".wdym-next-round").click();
    await Promise.all([host, guest].map((page) => expect(page.locator(".wdym-draft")).toBeVisible()));
    const nextRound = await Promise.all([host, guest].map((page) => page.evaluate(() => ({
      phase: state.whodidyoumake.phase,
      roundIndex: state.whodidyoumake.roundIndex,
      revision: state.whodidyoumake.revision,
      donors: state.whodidyoumake.rounds[1].donors.map((donor) => donor.id)
    }))));
    expect(nextRound[0]).toEqual(nextRound[1]);
    expect(nextRound[0].roundIndex).toBe(1);
  });

  test("host and guest refreshes retain identity and a replacement host can continue accepting claims", async ({ context }) => {
    const host = await context.newPage();
    const code = await hostRoom(host, "Hera");
    const guest1 = await context.newPage();
    const guest2 = await context.newPage();
    await joinRoom(guest1, "Ares", code);
    await joinRoom(guest2, "Zeus", code);
    await expect(host.locator(".lobby-player.here")).toHaveCount(3);
    await host.locator(".lobby-start").click();
    await Promise.all([host, guest1, guest2].map((page) => expect(page.locator(".wdym-draft")).toBeVisible()));

    const initialHost = await host.evaluate(() => ({ clientId: state.clientId, index: state.myRosterIndex, isHost: state.isHost }));
    await host.evaluate(() => WhoDidYouMake.claimPart(
      MakeRules.legalLiveClaims(state.whodidyoumake.rounds[0], state.myRosterIndex)[0].donorId,
      MakeRules.legalLiveClaims(state.whodidyoumake.rounds[0], state.myRosterIndex)[0].part
    ));
    await expect.poll(() => guest1.evaluate(() => state.whodidyoumake.rounds[0].claims.length)).toBe(1);
    await host.waitForTimeout(650);
    await host.reload();
    await expect(host.locator(".wdym-draft")).toBeVisible();
    await expect.poll(() => host.evaluate(() => ({ clientId: state.clientId, index: state.myRosterIndex, isHost: state.isHost }))).toEqual(initialHost);
    await expect.poll(() => guest2.evaluate(() => state.whodidyoumake.rounds[0].claims.length)).toBe(1);

    const guestIdentity = await guest2.evaluate(() => ({ clientId: state.clientId, index: state.myRosterIndex, isHost: state.isHost }));
    await guest2.waitForTimeout(650);
    await guest2.reload();
    await expect(guest2.locator(".wdym-draft")).toBeVisible();
    await expect.poll(() => guest2.evaluate(() => ({ clientId: state.clientId, index: state.myRosterIndex, isHost: state.isHost }))).toEqual(guestIdentity);

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
    await expect.poll(() => guest2.evaluate(() => state.hostClaimId)).toBe(await guest1.evaluate(() => state.clientId));

    const before = await guest1.evaluate(() => state.whodidyoumake.rounds[0].claims.length);
    await guest2.evaluate(() => {
      const round = state.whodidyoumake.rounds[0];
      const choice = MakeRules.legalLiveClaims(round, state.myRosterIndex)[0];
      WhoDidYouMake.claimPart(choice.donorId, choice.part);
    });
    await expect.poll(() => guest1.evaluate(() => state.whodidyoumake.rounds[0].claims.length)).toBe(before + 1);
    const converged = await Promise.all([guest1, guest2].map((page) => page.evaluate(() => ({
      revision: state.whodidyoumake.revision,
      claims: state.whodidyoumake.rounds[0].claims
    }))));
    expect(converged[0]).toEqual(converged[1]);
  });
});
