import { RefObject } from "react";

export const configGame = (
  preload: Phaser.Types.Scenes.ScenePreloadCallback,
  create: Phaser.Types.Scenes.ScenePreloadCallback,
  update: (this: Phaser.Scene) => void,
  gameContainerRef: RefObject<HTMLDivElement | null>
) => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: {
      preload,
      create,
      update,
    },
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.NONE,
      autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
    },
    parent: gameContainerRef?.current,
  };

  return config;
};
