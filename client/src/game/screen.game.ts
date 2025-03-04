import { socket } from "../config/socket.config";

export const screen = (
  players: Map<string, Phaser.GameObjects.Image>,
  game: Phaser.Game
) => {
  // Resize when window size changes
  const handleResize = () => {
    if (players.size > 0 && socket.id) {
      const playerSprite = players.get(socket.id);
      if (playerSprite) {
        game.scene.scenes[0].cameras.main.startFollow(
          playerSprite,
          true,
          0.1,
          0.1
        );
      }
    }
    game.scale.resize(window.innerWidth, window.innerHeight);
  };

  // Prevent double-tap to zoom
  const preventZoom = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  };

  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", handleResize);
  document.addEventListener("touchmove", preventZoom, { passive: false });
};
