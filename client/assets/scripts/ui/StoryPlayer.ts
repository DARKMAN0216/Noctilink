import { _decorator, Button, Component, JsonAsset, Label, resources } from "cc";
import { StoryEngine, WorldStateStore, type RuntimeChapter, type StoryChoice } from "../story";

const { ccclass, property } = _decorator;

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
    this.startNewGame();
  }

  loadChapter(chapterId: string) {
    resources.load(`story-data/${chapterId}`, JsonAsset, (error, asset) => {
      if (error || !asset) {
        this.setStatus(`章节加载失败：${chapterId}`);
        return;
      }

      this.currentChapterId = chapterId;
      this.engine = new StoryEngine(this.worldState);

      this.engine.loadChapter(asset.json as RuntimeChapter);
      this.render();
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

    this.setStatus(ending ? `结局：${ending.Title}` : `节点：${node.Id}`);
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
        text: "重新开始",
        run: () => this.startNewGame()
      }
    ];

    if (isCanonEnding && this.currentChapterId === "ch00_prologue") {
      actions.push({
        text: "进入第一章",
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

  private startNewGame() {
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
