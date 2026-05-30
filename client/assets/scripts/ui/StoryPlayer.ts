import { _decorator, Button, Component, JsonAsset, Label, Node, resources } from "cc";
import { StoryEngine, WorldStateStore, type RuntimeChapter, type StoryChoice } from "../story/index.js";

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
  private currentChoices: StoryChoice[] = [];

  onLoad() {
    this.choiceButtons.forEach((button, index) => {
      button.node.on(Button.EventType.CLICK, () => this.choose(index), this);
    });
  }

  start() {
    this.loadChapter("ch00_prologue");
  }

  loadChapter(chapterId: string) {
    resources.load(`story-data/${chapterId}`, JsonAsset, (error, asset) => {
      if (error || !asset) {
        this.setStatus(`Failed to load chapter: ${chapterId}`);
        return;
      }

      this.engine = new StoryEngine(new WorldStateStore({
        "attributes.A.insight": 2,
        "attributes.A.stamina": 10
      }));

      this.engine.loadChapter(asset.json as RuntimeChapter);
      this.render();
    });
  }

  choose(index: number) {
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

    if (this.titleLabel) {
      this.titleLabel.string = node.Title;
    }

    if (this.bodyLabel) {
      this.bodyLabel.string = ending?.Summary ?? node.Body ?? "";
    }

    for (let index = 0; index < this.choiceButtons.length; index += 1) {
      const button = this.choiceButtons[index];
      const label = this.choiceLabels[index];
      const choice = current[index];
      button.node.active = Boolean(choice);
      if (label && choice) {
        label.string = choice.Text;
      }
    }

    this.setStatus(ending ? `Ending: ${ending.Title}` : `Node: ${node.Id}`);
  }

  private setStatus(message: string) {
    if (this.statusLabel) {
      this.statusLabel.string = message;
    }
  }
}
