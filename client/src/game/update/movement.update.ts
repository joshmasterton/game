import { socket } from "../../config/socket.config";
import { updateHealthBar } from "../create/players.create";

let targetPlayerId: string | null = null;
const targetPositions = new Map<string, { x: number; y: number }>();
const targetRotations = new Map<string, number>();

export const updateMovement = (
  scene: Phaser.Scene,
  players: Map<string, { sprite: Phaser.GameObjects.Sprite }>
) => {
  if (socket.id) {
    // Get player and keys
    const player = players.get(socket.id);
    const cursors = scene.input.keyboard?.createCursorKeys();

    if (player) {
      let x = 0;
      let y = 0;

      // If keyboard movement
      if (cursors?.up.isDown) y = -1;
      if (cursors?.down.isDown) y = 1;
      if (cursors?.left.isDown) x = -1;
      if (cursors?.right.isDown) x = 1;

      // If click or tap on screen
      if (scene.input.activePointer.isDown) {
        const pointer = scene.input.activePointer;
        const worldPoint = scene.cameras.main.getWorldPoint(
          pointer.x,
          pointer.y
        );

        const clickedOnPlayer = isClickingOnOtherPlayer(worldPoint, players);

        // If pointer is on another player dont move otherwise move
        if (!clickedOnPlayer) {
          if (player.sprite) {
            const dx = pointer.worldX - player.sprite.x;
            const dy = pointer.worldY - player.sprite.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 10) {
              x = dx / distance;
              y = dy / distance;
            }
          }
        }
      }

      // Emit movement if any
      if (x !== 0 || y !== 0) {
        socket.emit("move", { x, y });
      }
    }
  }
};

export const targetPlayer = (
  scene: Phaser.Scene,
  players: Map<string, { sprite: Phaser.GameObjects.Sprite }>
) => {
  // If clicked on player target otherwise un-target
  scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
    const worldPoint = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);

    const clickedOnPlayer = isClickingOnOtherPlayer(worldPoint, players);

    if (clickedOnPlayer) {
      // Toggle targeting
      if (targetPlayerId === clickedOnPlayer) {
        const targetedPlayer = players.get(targetPlayerId);

        if (targetedPlayer && targetedPlayer.sprite) {
          targetedPlayer.sprite.clearTint();
        }

        targetPlayerId = null;
      } else {
        if (targetPlayerId) {
          // Clear previous target effect
          const previousTarget = players.get(targetPlayerId);

          if (previousTarget && previousTarget.sprite) {
            previousTarget.sprite.clearTint();
          }
        }

        // Set new target and tint
        targetPlayerId = clickedOnPlayer;
        const targetedPlayer = players.get(targetPlayerId);

        if (targetedPlayer && targetedPlayer.sprite) {
          targetedPlayer.sprite.setTintFill(0xffff00);
          targetedPlayer.sprite.setAlpha(1);
        }
      }

      socket.emit("targetPlayer", { id: targetPlayerId });
    }
  });
};

// Is player clicking on another player
export const isClickingOnOtherPlayer = (
  pointer: Phaser.Math.Vector2,
  players: Map<string, { sprite: Phaser.GameObjects.Sprite }>
) => {
  for (const [id, player] of players) {
    if (socket.id) {
      if (player === players.get(socket.id)) return false;
      if (player.sprite.getBounds().contains(pointer.x, pointer.y)) {
        return id;
      }
    }
  }

  return false;
};

export const updatePositions = (
  players: Map<string, { sprite: Phaser.GameObjects.Sprite }>
) => {
  socket.on(
    "updatePositions",
    (positions: Record<string, { x: number; y: number; rotation: number }>) => {
      // Send players positions to client
      Object.entries(positions).forEach(([id, position]) => {
        const player = players.get(id);

        if (player) {
          // Set current and target positions and rotations
          targetPositions.set(id, { x: position.x, y: position.y });
          targetRotations.set(id, position.rotation);
        }
      });
    }
  );
};

export const smoothUpdate = (
  players: Map<
    string,
    {
      sprite: Phaser.GameObjects.Sprite;
      healthBar: Phaser.GameObjects.Graphics;
    }
  >
) => {
  players.forEach((player, id) => {
    const targetPosition = targetPositions.get(id);
    const targetRotation = targetRotations.get(id);

    if (player.sprite && targetPosition && targetRotation) {
      // Smoothly move to new position
      player.sprite.x = Phaser.Math.Interpolation.Linear(
        [player.sprite.x, targetPosition.x],
        0.1
      );
      player.sprite.y = Phaser.Math.Interpolation.Linear(
        [player.sprite.y, targetPosition.y],
        0.1
      );

      // Update player healthbar position
      updateHealthBar(player.healthBar, player.sprite, 100);

      // Ensure rotation smoothly interpolates, handling angle wrapping
      let angleDifference = targetRotation - player.sprite.rotation;

      // Normalize angle difference to [-PI, PI] to prevent long rotation paths
      angleDifference = Phaser.Math.Angle.Wrap(angleDifference);

      // Apply smooth rotation interpolation
      player.sprite.rotation = player.sprite.rotation + angleDifference * 0.2;
    }
  });
};
