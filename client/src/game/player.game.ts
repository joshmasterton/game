import { Socket } from "socket.io-client";

export const playersUpdates = (
  playersData: { id: string; x: number; y: number; angle: number }[],
  players: Map<string, Phaser.GameObjects.Sprite>,
  scene: Phaser.Scene,
  socket: Socket
) => {
  playersData.forEach(({ id, x, y, angle }) => {
    const player = players.get(id);

    if (!player) {
      const sprite = scene.add
        .sprite(x, y, "player")
        .setScale(1)
        .setOrigin(0.5, 0.5)
        .setRotation(angle);

      sprite.setDisplaySize(30, 30);
      players.set(id, sprite);

      if (id === socket.id) {
        // Follow player with camera
        scene.cameras.main.startFollow(sprite, true, 0.2, 0.2);
      }
    } else {
      // Smoothly move the player to new position
      player.x = Phaser.Math.Linear(player.x, x, 0.1);
      player.y = Phaser.Math.Linear(player.y, y, 0.1);

      // Smoothly rotate the player towards the new angle
      const angleDifference = Phaser.Math.Angle.Wrap(player.rotation - angle);
      player.rotation -= angleDifference * 0.1; // Adjust the factor for smoothness
    }
  });
};
