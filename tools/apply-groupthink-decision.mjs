import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const value = (name) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
const confirmation = value("--confirm");
if (confirmation !== "APPLY_GATED_RULES") {
  throw new Error("Refusing to edit production rules without --confirm=APPLY_GATED_RULES");
}

const reportPath = path.resolve(value("--decision") || "test-results/groupthink-lab/decision.json");
const rulesPath = path.resolve(value("--rules") || "groupthink-rules.js");
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
if ((Number(report.sessionsPerCell) || 0) < 20_000) throw new Error("Decision is not based on 20,000 sessions per cell");

const decision = report.decision || {};
const saveGate = report.gates?.save;
const boardGate = report.gates?.board;
const doubleGate = report.gates?.doubleDown;
const saveCandidate = saveGate?.candidates?.find((candidate) => candidate.policy === decision.savePolicy);
const boardCandidate = boardGate?.candidates?.find((candidate) => candidate.policy === decision.boardPolicy);

if (decision.savePolicy !== "current" && !saveCandidate?.qualifies) throw new Error("Selected save policy did not pass its statistical gate");
if (decision.boardPolicy !== "all-30" && (!boardCandidate?.qualifies || !boardCandidate?.layoutPass)) {
  throw new Error("Selected board policy lacks simulation or device-layout evidence");
}
if (decision.doubleDown === true && !doubleGate?.qualifies) throw new Error("Double-down did not pass its statistical gate");

const saveMembers = {
  current: "current",
  "one-third": "oneThird",
  "two-fifths": "twoFifths",
  majority: "majority"
};
const boardMembers = {
  "all-30": "all30",
  "36-at-9": "thirtySixAt9",
  "40-at-9": "fortyAt9",
  "36-at-6-40-at-9": "stepped",
  "all-36": "all36"
};
if (!saveMembers[decision.savePolicy] || !boardMembers[decision.boardPolicy] || typeof decision.doubleDown !== "boolean") {
  throw new Error("Decision contains an unknown production rule");
}

const source = fs.readFileSync(rulesPath, "utf8");
const replacement = `const PRODUCTION = Object.freeze({\n    savePolicy: SAVE_POLICIES.${saveMembers[decision.savePolicy]},\n    boardPolicy: BOARD_POLICIES.${boardMembers[decision.boardPolicy]},\n    doubleDown: ${decision.doubleDown}\n  });`;
const pattern = /const PRODUCTION = Object\.freeze\(\{\n\s+savePolicy: SAVE_POLICIES\.[A-Za-z]+,\n\s+boardPolicy: BOARD_POLICIES\.[A-Za-z0-9]+,\n\s+doubleDown: (?:true|false)\n\s+\}\);/;
if (!pattern.test(source)) throw new Error("Could not find the production-rules block");
const next = source.replace(pattern, replacement);
if (next === source) {
  process.stdout.write(`Production rules already match ${JSON.stringify(decision)}\n`);
} else {
  fs.writeFileSync(rulesPath, next);
  process.stdout.write(`Applied gated production rules: ${JSON.stringify(decision)}\n`);
}

