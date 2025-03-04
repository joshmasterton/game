import { Socket } from "socket.io-client";

export const movement = (
  scene: Phaser.Scene,
  players: Map<string, Phaser.GameObjects.Sprite>,
  socket: Socket
) => {
  const cursors = scene.input.keyboard?.createCursorKeys();
  const speed = 5;

  if (!socket.id) return;
  const player = players.get(socket.id);
  if (!player || !cursors) return;

  const movement = { x: 0, y: 0 };

  // Check movement for all directions
  if (cursors.up.isDown) movement.y -= speed;
  if (cursors.down.isDown) movement.y += speed;
  if (cursors.left.isDown) movement.x -= speed;
  if (cursors.right.isDown) movement.x += speed;

  if (player.body) {
    // Emit movement to the server
    socket.emit("move", movement);
  }
};
