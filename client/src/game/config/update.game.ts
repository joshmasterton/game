import { socket } from "../../config/socket.config";

// Handle player movement updates
export const updateGame = (
  players: Map<
    string,
    {
      sprite: Phaser.GameObjects.Sprite;
      health: number;
      healthBar: Phaser.GameObjects.Graphics;
    }
  >,
  positions: Map<string, { x: number; y: number }>,
  rotations: Map<string, number>
) => {
  socket.on(
    "update",
    (data: { [id: string]: { x: number; y: number; rotation: number } }) => {
      Object.entries(data).forEach(([id, { x, y, rotation }]) => {
        if (players.has(id)) {
          const player = players.get(id);
          if (player) {
            positions.set(id, { x, y });
            rotations.set(id, rotation);
          }
        }
      });
    }
  );
};
