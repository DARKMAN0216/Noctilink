import { _decorator, Button, Component, JsonAsset, Label, resources, sys } from "cc";
import {
  SaveManager,
  StoryEngine,
  WorldStateStore,
  type RuntimeChapter,
  type StoryChoice,
  type StorySaveData
} from "../story";

const { ccclass, property } = _decorator;

const chapterLoadFailedText = "\u7ae0\u8282\u52a0\u8f7d\u5931\u8d25";
const endingText = "\u7ed3\u5c40";
const nodeText = "\u8282\u70b9";
const restartText = "\u91cd\u65b0\u5f00\u59cb";
const enterChapterOneText = "\u8fdb\u5165\u7b2c\u4e00\u7ae0";

@ccclass("StoryPlayer")
export class StoryPlayer extends Component {
  @property(Label)
  titleLabel: Label | null = null;

  @property(Label)
  bodyLabel: Label | null = null;

  @property([Button])
  choiceButtons: Button[] = [];

  @property([Label])
  choiceLabels: Label[] = [];

  @property(Label)
  statusLabel: Label | null = null;

  private readonly saveManager = new SaveManager(sys.localStorage);
  private engine: StoryEngine | null = null;
  private worldState = this.createInitialWorldState();
  private currentChapterId = "ch00_prologue";
  private currentChoices: StoryChoice[] = [];
  private currentActions: Array<() => void> = [];

  onLoad() {
    this.choiceButtons.forEach((button, index) => {
      button.node.on(Button.EventType.CLICK, () => this.choose(index), this);
    });
  }

  start() {
    const save = this.saveManager.load();
    if (save) {
      this.restoreGame(save);
      return;
    }

    this.startNewGame();
  }

  loadChapter(chapterId: string, restoreNodeId?: string, restoreEndingId?: string) {
    resources.load(`story-data/${chapterId}`, JsonAsset, (error, asset) => {
      if (error || !asset) {
        this.setStatus(`${chapterLoadFailedText}: ${chapterId}`);
        return;
      }

      this.currentChapterId = chapterId;
      this.engine = new StoryEngine(this.worldState);

      const chapter = asset.json as RuntimeChapter;
      if (restoreNodeId) {
        this.engine.restoreChapter(chapter, restoreNodeId, restoreEndingId);
      } else {
        this.engine.loadChapter(chapter);
      }

      this.render();
      this.saveCurrentProgress();
    });
  }

  choose(index: number) {
    const action = this.currentActions[index];
    if (action) {
      action();
      return;
    }

    const choice = this.currentChoices[index];
    if (!choice || !this.engine) {
      return;
    }

    this.engine.choose(choice.Id);
    this.render();
    this.saveCurrentProgress();
  }

  private render() {
    if (!this.engine) {
      return;
    }

    const node = this.engine.getCurrentNode();
    const current = this.engine.getAvailableChoices();
    const ending = this.engine.getCurrentEnding();
    this.currentChoices = current;
    this.currentActions = [];

    if (this.titleLabel) {
      this.titleLabel.string = node.Title;
    }

    if (this.bodyLabel) {
      this.bodyLabel.string = ending?.Summary ?? node.Body ?? "";
    }

    if (ending) {
      this.renderEndingActions(ending.EndingType === "canon");
    } else {
      this.renderChoices(current);
    }

    this.setStatus(ending ? `${endingText}: ${ending.Title}` : `${nodeText}: ${node.Id}`);
  }

  private renderChoices(choices: StoryChoice[]) {
    for (let index = 0; index < this.choiceButtons.length; index += 1) {
      const choice = choices[index];
      this.setButton(index, Boolean(choice), choice?.Text ?? "");
    }
  }

  private renderEndingActions(isCanonEnding: boolean) {
    const actions = [
      {
        text: restartText,
        run: () => this.startNewGame()
      }
    ];

    if (isCanonEnding && this.currentChapterId === "ch00_prologue") {
      actions.push({
        text: enterChapterOneText,
        run: () => this.loadChapter("ch01")
      });
    }

    this.currentActions = actions.map((action) => action.run);

    for (let index = 0; index < this.choiceButtons.length; index += 1) {
      this.setButton(index, Boolean(actions[index]), actions[index]?.text ?? "");
    }
  }

  private setButton(index: number, active: boolean, text: string) {
    const button = this.choiceButtons[index];
    const label = this.choiceLabels[index];
    if (!button) {
      return;
    }

    button.node.active = active;
    if (label) {
      label.string = text;
    }
  }

  private restoreGame(save: StorySaveData) {
    this.worldState = new WorldStateStore(save.worldState);
    this.loadChapter(save.currentChapterId, save.currentNodeId, save.currentEndingId);
  }

  private saveCurrentProgress() {
    if (!this.engine) {
      return;
    }

    this.saveManager.save({
      currentChapterId: this.currentChapterId,
      currentNodeId: this.engine.getCurrentNodeId(),
      currentEndingId: this.engine.getCurrentEnding()?.Id,
      worldState: this.engine.getWorldState(),
      choiceHistory: this.engine.getChoiceHistory()
    });
  }

  private startNewGame() {
    this.saveManager.clear();
    this.worldState = this.createInitialWorldState();
    this.loadChapter("ch00_prologue");
  }

  private createInitialWorldState() {
    return new WorldStateStore({
      "attributes.A.insight": 2,
      "attributes.A.stamina": 10
    });
  }

  private setStatus(message: string) {
    if (this.statusLabel) {
      this.statusLabel.string = message;
    }
  }
}
