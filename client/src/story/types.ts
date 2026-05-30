export type StoryValue = string | number | boolean | null;

export interface RuntimeChapter {
  Chapter: ChapterInfo;
  Nodes: StoryNode[];
  Endings: EndingDefinition[];
}

export interface ChapterInfo {
  Id: string;
  Title: string;
  Pov: string;
  EntryNode: string;
  Summary?: string;
}

export interface StoryNode {
  Id: string;
  Chapter: string;
  Pov: string;
  NodeKind: "story" | "router" | "ending" | "checkpoint";
  Title: string;
  Body?: string;
  Effects?: Effect[];
  Choices?: StoryChoice[];
  Routes?: StoryRoute[];
  Next?: string;
  Ending?: EndingReference;
}

export interface StoryChoice {
  Id: string;
  Text: string;
  Requirements?: ConditionGroup;
  Effects?: Effect[];
  Next?: string;
  Ending?: EndingReference;
  Hidden?: boolean;
}

export interface StoryRoute {
  Conditions?: ConditionGroup;
  Next?: string;
}

export interface EndingReference {
  Id: string;
}

export interface EndingDefinition {
  Id: string;
  Chapter: string;
  Pov: string;
  EndingType: "closed" | "canon";
  Category: string;
  Title: string;
  Summary?: string;
  CanonState?: Record<string, StoryValue>;
  Effects?: Effect[];
}

export interface ConditionGroup {
  All?: Condition[];
  Any?: Condition[];
}

export interface Condition {
  Var: string;
  Op: "==" | "!=" | ">" | ">=" | "<" | "<=" | "exists" | "not_exists" | "in";
  Value?: StoryValue | StoryValue[];
}

export interface Effect {
  Type:
    | "attribute.set"
    | "attribute.add"
    | "world.set"
    | "world.add"
    | "clue.add"
    | "clue.remove"
    | "flag.set"
    | "relationship.add"
    | "causal.record"
    | "ending.unlock"
    | "chapter.unlock";
  Target: string;
  Value?: StoryValue;
  Id?: string;
}

export interface ChoiceRecord {
  chapterId: string;
  nodeId: string;
  choiceId: string;
  at: string;
}
