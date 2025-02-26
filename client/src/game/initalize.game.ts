import { socket } from "../config/socket.config";
import { updateHealthBar } from "./player/health.player";

// Listen for the init event after connection
export const initializeGame = (
  scene: Phaser.Scene,
  positions: Map<string, { x: number; y: number }>,
  players: Map<
    string,
    {
      sprite: Phaser.GameObjects.Sprite;
      health: number;
      healthBar: Phaser.GameObjects.Graphics;
    }
  >
) => {
  socket.on("init", (data: { [id: string]: { x: number; y: number } }) => {
    // Create sprite if no player or set position if player exists
    Object.entries(data).forEach(([id, { x, y }]) => {
      if (!players.has(id)) {
        const sprite = scene.physics.add.sprite(x, y, "player");
        const scaleX = 35 / sprite.width;
        const scaleY = 35 / sprite.height;

        sprite.setScale(scaleX, scaleY);
        sprite.setData("id", id);

        // Create health bar
        const healthBar = scene.add.graphics();
        healthBar.setScale(35 / sprite.width, 35 / sprite.height);
        updateHealthBar(healthBar, x, y, 100);

        // Set player in map and position map
        players.set(id, { sprite: sprite, health: 100, healthBar });
        positions.set(id, { x, y });

        // Make camera follow player
        if (id === socket.id) {
          scene.cameras.main.startFollow(sprite, true, 0.25, 0.25);
        }
      } else {
        players.get(id)?.sprite.setPosition(x, y);
        positions.set(id, { x, y });
      }
    });
  });
};
