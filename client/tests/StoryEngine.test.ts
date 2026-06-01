import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { StoryEngine, WorldStateStore, type RuntimeChapter } from "../assets/scripts/story";

function loadRuntimeChapter(fileName: string): RuntimeChapter {
  const chapterPath = resolve(`../dist/story-data/${fileName}`);
  return JSON.parse(readFileSync(chapterPath, "utf8")) as RuntimeChapter;
}

const prologue = loadRuntimeChapter("ch00_prologue.json");
const chapterOne = loadRuntimeChapter("ch01.json");

const engine = new StoryEngine(new WorldStateStore({
  "attributes.A.insight": 2,
  "attributes.A.stamina": 10
}));

const firstState = engine.loadChapter(prologue);
assert.equal(firstState.nodeId, "ch00_a_001");
assert.equal(firstState.availableChoices.length, 2);

const canonState = engine.choose("follow_signal");
assert.equal(canonState.ending?.Id, "ch00_a_canon_signal");

const snapshot = engine.getWorldState();
assert.equal(snapshot["clues.core_signal"], "true");
assert.equal(snapshot["world.flags.ch00_finished"], "true");

const chapterOneCanon = new StoryEngine(new WorldStateStore({
  "attributes.A.insight": 2,
  "attributes.A.stamina": 10
}));
chapterOneCanon.loadChapter(chapterOne);
const traceState = chapterOneCanon.choose("inspect_lock");
assert.equal(traceState.ending?.Id, "ch01_a_canon_trace");

const chapterOneClosed = new StoryEngine(new WorldStateStore({
  "attributes.A.insight": 2,
  "attributes.A.stamina": 10
}));
chapterOneClosed.loadChapter(chapterOne);
const lostState = chapterOneClosed.choose("push_ahead");
assert.equal(lostState.ending?.Id, "ch01_a_closed_lost");

console.log("StoryEngine tests passed");
