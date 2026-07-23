import { expect, test } from "@playwright/test";

const relay = process.env.WDYM_RELAY || "";

test("the WebSocket relay preserves small, large, and fragmented messages", async ({ context }) => {
  test.skip(!relay, "requires a running relay via WDYM_RELAY");
  const sender = await context.newPage();
  const receiver = await context.newPage();
  const room = `relay-frames-${Date.now()}`;
  for (const page of [sender, receiver]) {
    await page.goto("/");
    await page.evaluate(({ relayUrl, roomCode }) => {
      window.receivedSizes = [];
      window.rawSocket = new WebSocket(`${relayUrl}/${roomCode}`);
      window.rawSocket.onmessage = (event) => window.receivedSizes.push(event.data.length);
    }, { relayUrl: relay.replace(/\/+$/, ""), roomCode: room });
    await expect.poll(() => page.evaluate(() => rawSocket.readyState)).toBe(1);
  }
  const sizes = [100, 1_000, 49_506, 59_895, 65_535, 65_536, 66_389, 150_000];
  for (const size of sizes) await sender.evaluate((length) => rawSocket.send("x".repeat(length)), size);
  await expect.poll(() => receiver.evaluate(() => receivedSizes), { timeout: 10_000 }).toEqual(sizes);
});
