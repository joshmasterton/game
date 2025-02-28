import { socket } from "../../config/socket.config";

// Listen for the init event after connection
export const initializePlayers = (
  scene: Phaser.Scene,
  players: Map<
    string,
    {
      sprite: Phaser.GameObjects.Sprite;
      healthBar: Phaser.GameObjects.Graphics;
    }
  >
) => {
  socket.on(
    "initializePlayers",
    (positions: Record<string, { x: number; y: number }>) => {
      // Create sprite if no player or set position if player exists
      Object.entries(positions).forEach(([id, { x, y }]) => {
        if (!players.has(id)) {
          const sprite = scene.physics.add.sprite(x, y, "player");

          // Scale and origin or sprite
          const scaleX = 35 / sprite.width;
          const scaleY = 35 / sprite.height;
          sprite.setScale(scaleX, scaleY);
          sprite.setData("id", id);
          sprite.setOrigin(0.5, 0.5);

          // Create health bar above player
          const healthBar = scene.add.graphics();
          updateHealthBar(healthBar, sprite, 100);

          // Set player in map and position map
          players.set(id, { sprite: sprite, healthBar });

          // Make camera follow player
          if (id === socket.id) {
            scene.cameras.main.startFollow(sprite, true, 0.2, 0.2);
          }
        } else {
          const player = players.get(id);

          if (player) {
            player.sprite.setPosition(x, y);
            updateHealthBar(player.healthBar, player.sprite, 100);
          }
        }
      });
    }
  );
};

export const updateHealthBar = (
  healthBar: Phaser.GameObjects.Graphics,
  player: Phaser.GameObjects.Sprite,
  health: number
) => {
  // Bar dimensions
  const barWidth = 40;
  const barHeight = 5;

  // Clear previous healthbar
  healthBar.clear();

  // Draw the healthbar
  healthBar.fillStyle(0xff0000, 1);
  healthBar.fillRect(
    player.x - barWidth / 2,
    player.y - player.height / 2 - barHeight + 240,
    barWidth,
    barHeight
  );

  healthBar.fillStyle(0x00ff00, 1);
  healthBar.fillRect(
    player.x - barWidth / 2,
    player.y - player.height / 2 - barHeight + 240,
    (health / 100) * barWidth,
    barHeight
  );
};
