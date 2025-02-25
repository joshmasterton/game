import { socket } from "../../config/socket.config";

export const health = (
  players: Map<
    string,
    {
      sprite: Phaser.GameObjects.Sprite;
      health: number;
      healthBar: Phaser.GameObjects.Graphics;
    }
  >
) => {
  socket.on(
    "playerHealthUpdate",
    ({ playerId, health }: { playerId: string; health: number }) => {
      // Decrese players health
      const player = players.get(playerId);
      if (player) {
        player.health = health;
      }
    }
  );

  socket.on("playerDied", ({ playerId }: { playerId: string }) => {
    // Player is dead
    const player = players.get(playerId);
    if (player) {
      player.health = 0;
    }
  });
};

export const updateHealthBar = (
  healthBar: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  health: number
) => {
  const barWidth = 40;
  const barHeight = 5;
  const maxHealth = 100;
  const healthPercent = Phaser.Math.Clamp(health / maxHealth, 0, 1);

  healthBar.setPosition(x, y);

  // Clear and update healthbar
  healthBar.clear();

  // Background bar
  healthBar.fillStyle(0x555555, 1);
  healthBar.fillRect(x, y, barWidth, barHeight);

  // Health bar
  healthBar.fillStyle(0xff0000, 1);
  healthBar.fillRect(x, y, healthPercent * barWidth, barHeight);
};
