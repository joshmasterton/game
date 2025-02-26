import { socket } from "../../config/socket.config";

export const shoot = (
  players: Map<string, { sprite: Phaser.GameObjects.Sprite; health: number }>,
  bullets: Map<number, Phaser.GameObjects.Sprite>,
  scene: Phaser.Scene
) => {
  // Create bullet
  socket.on(
    "bulletCreated",
    (data: { id: number; x: number; y: number; vx: number; vy: number }) => {
      const bullet = scene.physics.add.sprite(data.x, data.y, "player");

      // Set position and scale
      const scaleX = 5 / bullet.width;
      const scaleY = 5 / bullet.height;
      bullet.setScale(scaleX, scaleY);
      bullet.setVelocity(data.vx * 50, data.vy * 50);

      bullets.set(data.id, bullet);
    }
  );

  // Has player been hit
  socket.on(
    "playerHit",
    ({ playerId, bulletId }: { playerId: string; bulletId: number }) => {
      // Update player health
      const player = players.get(playerId);

      if (player) {
        player.health -= 10;
      }

      // Destroy bullet
      const bullet = bullets.get(bulletId);
      if (bullet) {
        bullet.destroy();
        bullets.delete(bulletId);
      }
    }
  );
};
