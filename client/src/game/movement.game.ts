import { Socket } from "socket.io-client";

export const movement = (
  scene: Phaser.Scene,
  socket: Socket,
  players: Map<string, Phaser.GameObjects.Sprite>
) => {
  if (!socket.id) return;

  const player = players.get(socket.id);

  if (player) {
    const pointer = scene.input.activePointer;
    const cursors = scene.input.keyboard?.createCursorKeys();
    const keys = scene.input.keyboard?.addKeys({
      W: "W",
      A: "A",
      S: "S",
      D: "D",
    }) as Record<string, Phaser.Input.Keyboard.Key>;

    let dirX = 0;
    let dirY = 0;

    // Keyboard movement (raw direction, no normalization)
    if (cursors?.left?.isDown || keys.A?.isDown) dirX = -1;
    if (cursors?.right?.isDown || keys.D?.isDown) dirX = 1;
    if (cursors?.up?.isDown || keys.W?.isDown) dirY = -1;
    if (cursors?.down?.isDown || keys.S?.isDown) dirY = 1;

    // Normalize keyboard movement
    const magnitude = Math.sqrt(dirX * dirX + dirY * dirY);
    if (magnitude > 0) {
      dirX /= magnitude;
      dirY /= magnitude;
    }

    if (pointer.isDown) {
      // Use getWorldPoint to calculate world coordinates of the pointer
      const worldPoint = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

      // Calculate direction from player to pointer, in world space
      const dx = worldPoint.x - player.x;
      const dy = worldPoint.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 50) {
        // If the distance is large enough, normalize the direction and send it
        dirX = dx / distance; // Normalized X direction
        dirY = dy / distance; // Normalized Y direction
      }
    }

    // Only send movement if there is input
    if (dirX !== 0 || dirY !== 0) {
      socket.emit("move", { x: dirX, y: dirY });
    }
  }
};
