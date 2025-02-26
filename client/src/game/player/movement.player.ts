import { socket } from "../../config/socket.config";

export const movePlayer = (
  scene: Phaser.Scene,
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
  // Interpolate for smooth movement
  players.forEach((player, id) => {
    const targetPosition = positions.get(id);
    const targetRotation = rotations.get(id);

    if (targetPosition) {
      player.sprite.x = Phaser.Math.Linear(
        player.sprite.x,
        targetPosition.x,
        0.1
      );
      player.sprite.y = Phaser.Math.Linear(
        player.sprite.y,
        targetPosition.y,
        0.1
      );
    }

    if (targetRotation) {
      let angleDifference = targetRotation - player.sprite.rotation;

      if (angleDifference > Math.PI) {
        angleDifference -= 2 * Math.PI;
      } else if (angleDifference < -Math.PI) {
        angleDifference += 2 * Math.PI;
      }

      player.sprite.rotation = Phaser.Math.Linear(
        player.sprite.rotation,
        player.sprite.rotation + angleDifference,
        0.1
      );
    } else {
      player.sprite.rotation = Phaser.Math.Linear(
        player.sprite.rotation,
        0,
        0.1
      );
    }
  });

  // Update player movement
  const cursors = scene.input.keyboard?.createCursorKeys();
  const pointer = scene.input.activePointer;
  const movement = { x: 0, y: 0 };

  // Update movement on click(desktop)
  if (cursors?.up.isDown) movement.y = -1;
  if (cursors?.down.isDown) movement.y = 1;
  if (cursors?.left.isDown) movement.x = -1;
  if (cursors?.right.isDown) movement.x = 1;

  // Update player movement on tap(mobile)
  if (pointer.isDown) {
    if (socket.id) {
      const player = players.get(socket.id);

      if (player) {
        const currentPosition = player.sprite.getCenter();

        // Adjust the pointer based on camera position
        const adjustedPointerX = pointer.x + scene.cameras.main.scrollX;
        const adjustedPointerY = pointer.y + scene.cameras.main.scrollY;

        const angle = Phaser.Math.Angle.Between(
          currentPosition?.x,
          currentPosition?.y,
          adjustedPointerX,
          adjustedPointerY
        );
        const distance = Phaser.Math.Distance.Between(
          currentPosition.x,
          currentPosition.y,
          adjustedPointerX,
          adjustedPointerY
        );

        movement.x = Math.cos(angle) * (distance / 10);
        movement.y = Math.sin(angle) * (distance / 10);
      }
    }
  }

  if (movement.x !== 0 || movement.y !== 0) {
    socket.emit("move", movement);
  }
};
