# Noctilink Cocos Client

Open this folder with Cocos Creator 3.8.8:

```text
E:\Noctilink\client
```

## First Scene Setup

Create the first playable scene in Cocos Creator:

1. Create a scene named `StoryMain` under `assets/scenes`.
2. Add a Canvas.
3. Under Canvas, add labels for title, body, and status.
4. Add three buttons for choices.
5. Add `assets/scripts/ui/StoryPlayer.ts` to the Canvas node.
6. Drag the title/body/status labels into the matching StoryPlayer properties.
7. Drag the three buttons into `choiceButtons`.
8. Drag each button text label into `choiceLabels`.
9. Press Preview.

`StoryPlayer` loads `resources/story-data/ch00_prologue.json` and binds button clicks automatically.

Preview progress is saved automatically through local storage. Use the ending action `重新开始` to clear the current local run and restart from the prologue.
