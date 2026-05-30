import type { Effect } from "./types";
import { WorldStateStore } from "./WorldStateStore";

export class EffectApplier {
  constructor(private readonly state: WorldStateStore) {}

  applyMany(effects: Effect[] = []): void {
    for (const effect of effects) {
      this.apply(effect);
    }
  }

  apply(effect: Effect): void {
    switch (effect.Type) {
      case "attribute.set":
      case "world.set":
      case "flag.set":
      case "clue.add":
        this.state.set(effect.Target, effect.Value ?? true);
        break;
      case "attribute.add":
      case "world.add":
      case "relationship.add":
        this.state.add(effect.Target, effect.Value ?? 0);
        break;
      case "clue.remove":
        this.state.remove(effect.Target);
        break;
      case "ending.unlock":
      case "chapter.unlock":
      case "causal.record":
        this.state.set(effect.Target, effect.Value ?? true);
        break;
    }
  }
}
