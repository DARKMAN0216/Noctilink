import { ConditionEvaluator } from "./ConditionEvaluator";
import { EffectApplier } from "./EffectApplier";
import type { ChoiceRecord, EndingDefinition, RuntimeChapter, StoryChoice, StoryNode, StoryValue } from "./types";
import { WorldStateStore } from "./WorldStateStore";

export interface StoryEngineState {
  chapterId: string;
  nodeId: string;
  availableChoices: StoryChoice[];
  ending?: EndingDefinition;
}

export class StoryEngine {
  private chapter?: RuntimeChapter;
  private currentNode?: StoryNode;
  private currentEnding?: EndingDefinition;
  private readonly choices: ChoiceRecord[] = [];
  private readonly evaluator: ConditionEvaluator;
  private readonly effects: EffectApplier;

  constructor(private readonly worldState = new WorldStateStore()) {
    this.evaluator = new ConditionEvaluator(worldState);
    this.effects = new EffectApplier(worldState);
  }

  loadChapter(chapter: RuntimeChapter): StoryEngineState {
    this.chapter = chapter;
    return this.enterNode(chapter.Chapter.EntryNode);
  }

  restoreChapter(chapter: RuntimeChapter, nodeId: string, endingId?: string): StoryEngineState {
    this.chapter = chapter;

    const node = chapter.Nodes.find((candidate) => candidate.Id === nodeId);
    if (!node) {
      return this.loadChapter(chapter);
    }

    this.currentNode = node;
    this.currentEnding = endingId ? this.findEnding(endingId) : undefined;
    return this.describeState();
  }

  enterNode(nodeId: string): StoryEngineState {
    const chapter = this.requireChapter();
    const node = chapter.Nodes.find((candidate) => candidate.Id === nodeId);
    if (!node) {
      throw new Error(`Story node not found: ${nodeId}`);
    }

    this.currentNode = node;
    this.currentEnding = undefined;
    this.effects.applyMany(node.Effects);

    if (node.NodeKind === "router") {
      const route = (node.Routes ?? []).find((candidate) => this.evaluator.evaluate(candidate.Conditions));
      if (!route?.Next) {
        throw new Error(`Router node has no matching route: ${node.Id}`);
      }

      return this.enterNode(route.Next);
    }

    if (node.Next && !node.Choices?.length && !node.Ending) {
      return this.enterNode(node.Next);
    }

    if (node.Ending?.Id) {
      return this.enterEnding(node.Ending.Id);
    }

    return this.describeState();
  }

  choose(choiceId: string): StoryEngineState {
    if (!this.currentNode) {
      throw new Error("No current node loaded.");
    }

    const choice = this.getAvailableChoices().find((candidate) => candidate.Id === choiceId);
    if (!choice) {
      throw new Error(`Choice is not available: ${choiceId}`);
    }

    this.choices.push({
      chapterId: this.currentNode.Chapter,
      nodeId: this.currentNode.Id,
      choiceId,
      at: new Date().toISOString()
    });

    this.effects.applyMany(choice.Effects);

    if (choice.Ending?.Id) {
      return this.enterEnding(choice.Ending.Id);
    }

    if (!choice.Next) {
      throw new Error(`Choice has no next target: ${choiceId}`);
    }

    return this.enterNode(choice.Next);
  }

  getCurrentNode(): StoryNode {
    if (!this.currentNode) {
      throw new Error("No current node loaded.");
    }

    return this.currentNode;
  }

  getAvailableChoices(): StoryChoice[] {
    return (this.currentNode?.Choices ?? []).filter((choice) => this.evaluator.evaluate(choice.Requirements));
  }

  getChoiceHistory(): ChoiceRecord[] {
    return [...this.choices];
  }

  getCurrentNodeId(): string {
    return this.getCurrentNode().Id;
  }

  getCurrentEnding(): EndingDefinition | undefined {
    return this.currentEnding;
  }

  getWorldState(): Record<string, StoryValue> {
    return this.worldState.snapshot();
  }

  private describeState(): StoryEngineState {
    const node = this.getCurrentNode();
    return {
      chapterId: node.Chapter,
      nodeId: node.Id,
      availableChoices: this.getAvailableChoices(),
      ending: node.Ending?.Id ? this.findEnding(node.Ending.Id) : undefined
    };
  }

  private enterEnding(endingId: string): StoryEngineState {
    const ending = this.findEnding(endingId);
    this.currentEnding = ending;
    this.effects.applyMany(ending.Effects);

    if (ending.EndingType === "canon" && ending.CanonState) {
      for (const [key, value] of Object.entries(ending.CanonState)) {
        this.worldState.set(key, value);
      }
    }

    return {
      chapterId: ending.Chapter,
      nodeId: this.currentNode?.Id ?? "",
      availableChoices: [],
      ending
    };
  }

  private findEnding(endingId: string): EndingDefinition {
    const ending = this.requireChapter().Endings.find((candidate) => candidate.Id === endingId);
    if (!ending) {
      throw new Error(`Ending not found: ${endingId}`);
    }

    return ending;
  }

  private requireChapter(): RuntimeChapter {
    if (!this.chapter) {
      throw new Error("No chapter loaded.");
    }

    return this.chapter;
  }
}
