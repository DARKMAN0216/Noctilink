import type { ChoiceRecord, StorySaveData, StoryValue } from "./types";

export interface SaveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SaveSnapshotInput {
  currentChapterId: string;
  currentNodeId: string;
  currentEndingId?: string;
  worldState: Record<string, StoryValue>;
  choiceHistory: ChoiceRecord[];
}

export class SaveManager {
  static readonly mainSlot = "noctilink.save.main";
  static readonly saveVersion = "0.1.0";

  constructor(
    private readonly storage: SaveStorage,
    private readonly slot = SaveManager.mainSlot
  ) {}

  load(): StorySaveData | null {
    const raw = this.storage.getItem(this.slot);
    if (!raw) {
      return null;
    }

    try {
      const data = JSON.parse(raw) as StorySaveData;
      if (data.saveVersion !== SaveManager.saveVersion || !data.currentChapterId || !data.currentNodeId) {
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  save(snapshot: SaveSnapshotInput): StorySaveData {
    const data: StorySaveData = {
      saveVersion: SaveManager.saveVersion,
      updatedAt: new Date().toISOString(),
      currentChapterId: snapshot.currentChapterId,
      currentNodeId: snapshot.currentNodeId,
      currentEndingId: snapshot.currentEndingId,
      worldState: snapshot.worldState,
      choiceHistory: snapshot.choiceHistory
    };

    this.storage.setItem(this.slot, JSON.stringify(data));
    return data;
  }

  clear(): void {
    this.storage.removeItem(this.slot);
  }
}
