import type { StoryValue } from "./types.js";

export class WorldStateStore {
  private readonly values = new Map<string, StoryValue>();

  constructor(initialValues: Record<string, StoryValue> = {}) {
    for (const [key, value] of Object.entries(initialValues)) {
      this.values.set(key, value);
    }
  }

  get(path: string): StoryValue | undefined {
    return this.values.get(path);
  }

  has(path: string): boolean {
    return this.values.has(path);
  }

  set(path: string, value: StoryValue): void {
    this.values.set(path, value);
  }

  add(path: string, delta: StoryValue): void {
    const current = this.values.get(path);
    const currentNumber = typeof current === "number" ? current : Number(current ?? 0);
    const deltaNumber = typeof delta === "number" ? delta : Number(delta ?? 0);
    this.values.set(path, currentNumber + deltaNumber);
  }

  remove(path: string): void {
    this.values.delete(path);
  }

  snapshot(): Record<string, StoryValue> {
    return Object.fromEntries(this.values.entries());
  }
}
