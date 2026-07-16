// Hidden, local-only instrumentation for automated WHO? DO YOU THINK? browser runs.
(function installGroupthinkLab(root) {
  const SCHEMA_VERSION = 1;
  const STORAGE_KEY = "whoisit_gt_lab_v1";
  let run = null;

  function enabled() {
    try { return new URLSearchParams(root.location?.search || "").get("gtLab") === "1" || root.WHOISIT_GT_LAB === true; }
    catch (error) { return root.WHOISIT_GT_LAB === true; }
  }

  function safe(value, depth = 0) {
    if (depth > 5 || value == null) return value == null ? null : undefined;
    if (["string", "number", "boolean"].includes(typeof value)) return value;
    if (Array.isArray(value)) return value.slice(0, 80).map((item) => safe(item, depth + 1));
    if (typeof value === "object") {
      const out = {};
      Object.entries(value).forEach(([key, item]) => {
        if (/name|room|client/i.test(key)) return;
        const cleaned = safe(item, depth + 1);
        if (cleaned !== undefined) out[key] = cleaned;
      });
      return out;
    }
    return undefined;
  }

  function persist() {
    if (!enabled() || !run) return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(run)); } catch (error) { /* lab persistence is best-effort */ }
  }

  function restore(seed) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
      return saved?.schemaVersion === SCHEMA_VERSION && saved?.config?.seed === seed ? saved : null;
    } catch (error) { return null; }
  }

  function strategiesFromUrl(playerCount) {
    let values = [];
    try {
      const params = new URLSearchParams(root.location?.search || "");
      values = (params.get("gtStrategies") || "").split(",").map((item) => item.trim()).filter(Boolean);
      if (!values.length && params.get("gtStrategy")) values = Array(playerCount).fill(params.get("gtStrategy"));
    } catch (error) { /* no URL in pure tests */ }
    return Array.from({ length: playerCount }, (_, seat) => values[seat] || null);
  }

  function start(config = {}, options = {}) {
    if (!enabled()) return null;
    const cleanConfig = safe(config);
    const prior = options.resume !== false ? restore(cleanConfig.seed) : null;
    run = prior || {
      schemaVersion: SCHEMA_VERSION,
      runId: `gtlab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      config: { ...cleanConfig, strategies: strategiesFromUrl(cleanConfig.playerCount || 0) },
      rounds: [],
      events: [],
      phase: null,
      phaseStartedAt: Date.now()
    };
    event(prior ? "resume" : "start", { roundIndex: config.roundIndex || 0 });
    renderControls();
    return run;
  }

  function event(type, data = {}) {
    if (!enabled() || !run) return;
    run.events.push({ atMs: Date.now() - Date.parse(run.createdAt), type: String(type).slice(0, 40), data: safe(data) });
    if (run.events.length > 1000) run.events.shift();
    persist();
    renderControls();
  }

  function phase(name, data = {}) {
    if (!enabled() || !run) return;
    const now = Date.now();
    if (run.phase) event("phase-complete", { phase: run.phase, durationMs: Math.max(0, now - run.phaseStartedAt), ...data });
    run.phase = String(name);
    run.phaseStartedAt = now;
    event("phase", { phase: run.phase, ...data });
  }

  function recordRound(roundData) {
    if (!enabled() || !run || !roundData || !Number.isInteger(roundData.roundIndex)) return;
    const cleaned = safe(roundData);
    const index = run.rounds.findIndex((round) => round.roundIndex === cleaned.roundIndex);
    if (index >= 0) run.rounds[index] = cleaned;
    else run.rounds.push(cleaned);
    run.rounds.sort((a, b) => a.roundIndex - b.roundIndex);
    persist();
    renderControls();
  }

  function receive(message, roster = []) {
    if (!enabled() || !run || message?.kind !== "strategy") return false;
    const seat = roster.findIndex((entry) => entry.clientId && entry.clientId === message.clientId);
    if (seat < 0) return false;
    const strategy = typeof message.strategy === "string" ? message.strategy.slice(0, 24) : null;
    if (!Array.isArray(run.config.strategies)) run.config.strategies = [];
    run.config.strategies[seat] = strategy;
    event("strategy", { seat, strategy });
    return true;
  }

  function announce() {
    if (!enabled() || typeof root.netSend !== "function") return;
    let strategy = null;
    try { strategy = new URLSearchParams(root.location?.search || "").get("gtStrategy"); } catch (error) { /* fine */ }
    if (strategy) root.netSend("gt-lab-event", { kind: "strategy", strategy: strategy.slice(0, 24) });
  }

  function setHost(canExport) {
    if (!enabled() || !run) return;
    run.config.hostCanExport = !!canExport;
    persist();
    renderControls();
  }

  function summary() {
    const rounds = run?.rounds || [];
    const playerRounds = rounds.reduce((sum, round) => sum + (round.matchCounts?.length || 0), 0);
    const zeroMatches = rounds.reduce((sum, round) => sum + (round.matchCounts || []).filter((count) => count === 0).length, 0);
    const saveRounds = rounds.filter((round) => round.saveOutcome).length;
    const saves = rounds.filter((round) => round.saveOutcome?.savedId != null).length;
    return {
      completedRounds: rounds.length,
      zeroMatchRate: playerRounds ? zeroMatches / playerRounds : 0,
      wholeRoomZeroRate: rounds.length ? rounds.filter((round) => round.matchCounts?.every((count) => count === 0)).length / rounds.length : 0,
      saveSuccessRate: saveRounds ? saves / saveRounds : 0,
      saveTieRate: saveRounds ? rounds.filter((round) => round.saveOutcome?.tied).length / saveRounds : 0,
      firstRoundReduction: rounds[0]?.boardBefore ? (rounds[0].boardBefore - rounds[0].boardAfter) / rounds[0].boardBefore : 0
    };
  }

  function payload() {
    if (!run) return null;
    return safe({ ...run, exportedAt: new Date().toISOString(), summary: summary() });
  }

  function csv() {
    const headers = [
      "recordType", "schemaVersion", "runId", "seed", "eventType", "atMs", "roundIndex", "phase", "revision",
      "boardBefore", "boardAfter", "pickCount", "picks", "matchCounts", "roundScores", "doubleDowns", "doubleDownHits",
      "saved", "tied", "removedCount", "data"
    ];
    const escape = (value) => {
      const text = typeof value === "object" && value != null ? JSON.stringify(value) : String(value ?? "");
      return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
    };
    const common = [SCHEMA_VERSION, run?.runId || "", run?.config?.seed || ""];
    const rows = [
      ["meta", ...common, "", "", run?.config?.roundIndex || 0, run?.phase || "", "", "", "", "", "", "", "", "", "", "", "", "", safe(run?.config || {})],
      ...(run?.rounds || []).map((round) => [
        "round", ...common, "", "", round.roundIndex, "results", round.revision || "",
        round.boardBefore, round.boardAfter, round.pickCount, round.picks, round.matchCounts,
        round.roundScores, round.doubleDowns, round.doubleDownHits, round.saveOutcome?.savedId != null,
        !!round.saveOutcome?.tied, round.saveOutcome?.removedIds?.length || 0, round.saveOutcome || ""
      ]),
      ...(run?.events || []).map((entry) => [
        "event", ...common, entry.type, entry.atMs, entry.data?.roundIndex ?? "", entry.data?.phase || "",
        entry.data?.revision ?? "", "", "", "", "", "", "", "", "", "", "", "", entry.data || ""
      ])
    ];
    return `${headers.join(",")}\n${rows.map((row) => row.map(escape).join(",")).join("\n")}\n`;
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = filename; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportJson() {
    if (!run) return;
    download(`${run.runId}.json`, `${JSON.stringify(payload(), null, 2)}\n`, "application/json");
  }

  function exportCsv() {
    if (!run) return;
    download(`${run.runId}.csv`, csv(), "text/csv");
  }

  function renderControls() {
    if (!enabled() || !run || typeof document === "undefined") return;
    const allowed = run.config.hostCanExport !== false;
    let panel = document.querySelector("#gtLabPanel");
    if (!allowed) { panel?.remove(); return; }
    if (!panel) {
      panel = document.createElement("aside");
      panel.id = "gtLabPanel";
      panel.className = "gt-lab-panel";
      document.body.appendChild(panel);
    }
    const stats = summary();
    panel.innerHTML = `<b>GT LAB</b><span>${stats.completedRounds} rounds · ${(stats.zeroMatchRate * 100).toFixed(1)}% zero-match</span><button type="button" data-export="json">JSON</button><button type="button" data-export="csv">CSV</button>`;
    panel.querySelector('[data-export="json"]').addEventListener("click", exportJson);
    panel.querySelector('[data-export="csv"]').addEventListener("click", exportCsv);
  }

  function reset() {
    run = null;
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (error) { /* fine */ }
    if (typeof document !== "undefined") document.querySelector("#gtLabPanel")?.remove();
  }

  root.GroupthinkLab = {
    SCHEMA_VERSION,
    enabled,
    start,
    event,
    phase,
    recordRound,
    receive,
    announce,
    setHost,
    summary,
    payload,
    csv,
    exportJson,
    exportCsv,
    renderControls,
    reset
  };
})(typeof window !== "undefined" ? window : globalThis);
