import type { Condition, ConditionGroup, StoryValue } from "./types";
import { WorldStateStore } from "./WorldStateStore";

export class ConditionEvaluator {
  constructor(private readonly state: WorldStateStore) {}

  evaluate(group?: ConditionGroup): boolean {
    if (!group) {
      return true;
    }

    const all = group.All ?? [];
    const any = group.Any ?? [];
    const allResult = all.every((condition) => this.evaluateCondition(condition));
    const anyResult = any.length === 0 || any.some((condition) => this.evaluateCondition(condition));
    return allResult && anyResult;
  }

  private evaluateCondition(condition: Condition): boolean {
    const actual = this.state.get(condition.Var);
    switch (condition.Op) {
      case "exists":
        return this.state.has(condition.Var);
      case "not_exists":
        return !this.state.has(condition.Var);
      case "==":
        return actual === normalizeValue(condition.Value);
      case "!=":
        return actual !== normalizeValue(condition.Value);
      case ">":
        return toNumber(actual) > toNumber(condition.Value);
      case ">=":
        return toNumber(actual) >= toNumber(condition.Value);
      case "<":
        return toNumber(actual) < toNumber(condition.Value);
      case "<=":
        return toNumber(actual) <= toNumber(condition.Value);
      case "in":
        return Array.isArray(condition.Value) && condition.Value.includes(actual ?? null);
    }
  }
}

function toNumber(value: StoryValue | StoryValue[] | undefined): number {
  if (typeof value === "number") {
    return value;
  }

  return Number(value ?? 0);
}

function normalizeValue(value: StoryValue | StoryValue[] | undefined): StoryValue {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
