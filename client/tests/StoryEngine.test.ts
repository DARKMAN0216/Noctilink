import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { StoryEngine, WorldStateStore, type RuntimeChapter } from "../src/story/index.js";

const chapterPath = resolve("../dist/story-data/ch00_prologue.json");
const chapter = JSON.parse(readFileSync(chapterPath, "utf8")) as RuntimeChapter;

const engine = new StoryEngine(new WorldStateStore({
  "attributes.A.insight": 2,
  "attributes.A.stamina": 10
}));

const firstState = engine.loadChapter(chapter);
assert.equal(firstState.nodeId, "ch00_a_001");
assert.equal(firstState.availableChoices.length, 2);

const canonState = engine.choose("follow_signal");
assert.equal(canonState.ending?.Id, "ch00_a_canon_signal");

const snapshot = engine.getWorldState();
assert.equal(snapshot["clues.core_signal"], "true");
assert.equal(snapshot["world.flags.ch00_finished"], "true");

console.log("StoryEngine tests passed");
