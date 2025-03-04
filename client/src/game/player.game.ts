import { Socket } from "socket.io-client";

export const createPlayer = (
  socket: Socket,
  scene: Phaser.Scene,
  players: Map<string, Phaser.GameObjects.Image>
) => {
  socket.on(
    "players",
    (
      playersData: {
        id: string;
        x: number;
        y: number;
        velocity: { x: number; y: number };
      }[]
    ) => {
      playersData.forEach((data) => {
        // Add player to world
        if (!players.has(data.id)) {
          const sprite = scene.physics.add.image(data.x, data.y, "player");
          sprite.setDisplaySize(30, 30);

          // Follow player
          if (data.id === socket.id) {
            scene.cameras.main.startFollow(sprite, true, 0.1, 0.1);
          }

          players.set(data.id, sprite);
        } else {
          // Update players movement
          const sprite = players.get(data.id);
          if (sprite && sprite.body) {
            sprite.body.velocity.x = data.velocity.x;
            sprite.body.velocity.y = data.velocity.y;

            scene.tweens.add({
              targets: sprite,
              x: data.x,
              y: data.y,
              duration: 150,
              ease: "Linear",
            });
          }
        }
      });
    }
  );

  // Remove disconnected player
  socket.on("removePlayer", (playerId: string) => {
    if (players.has(playerId)) {
      players.get(playerId)?.destroy();
      players.delete(playerId);
    }
  });
};
