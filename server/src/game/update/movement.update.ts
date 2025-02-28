import Matter from "matter-js";
import { Socket } from "socket.io";
import { io } from "../../app";

export const updateMovement = (
  socket: Socket,
  players: Map<string, { body: Matter.Body; targetId: string | null }>
) => {
  // Update velocity
  socket.on("move", ({ x, y }: { x: number; y: number }) => {
    const player = players.get(socket.id);
    if (player) {
      // Update players movement direction
      const speed = 5;
      const velocityX = x * speed;
      const velocityY = y * speed;

      // If the player has a target, lock onto the target and move towards it
      if (player.targetId) {
        const targetPlayer = players.get(player.targetId);

        if (targetPlayer) {
          // Calculate direction towards the target
          const dx = targetPlayer.body.position.x - player.body.position.x;
          const dy = targetPlayer.body.position.y - player.body.position.y;
          const targetAngle = Math.atan2(dy, dx);

          // Smoothly rotate towards the target
          let angleDifference = targetAngle - player.body.angle;
          while (angleDifference > Math.PI) angleDifference -= Math.PI * 2;
          while (angleDifference < -Math.PI) angleDifference += Math.PI * 2;

          // Apply smooth rotation towards target
          const newAngle = player.body.angle + angleDifference * 0.1;
          Matter.Body.setAngle(player.body, newAngle);
        } else {
          player.targetId = null;
        }
      } else {
        // Calculate angle and set rotation
        const targetAngle = Math.atan2(y, x);

        // Smooth the rotation
        const currentAngle = player.body.angle;
        let angleDifference = targetAngle - currentAngle;

        // Normalize the angle difference to the range [-PI, PI]
        while (angleDifference > Math.PI) angleDifference -= Math.PI * 2;
        while (angleDifference < -Math.PI) angleDifference += Math.PI * 2;

        // Apply smoothing
        const rotationLerpSpeed = 0.1;
        const newAngle = currentAngle + angleDifference * rotationLerpSpeed;

        Matter.Body.setAngle(player.body, newAngle);
      }

      // Set new velocity of player
      Matter.Body.setVelocity(player.body, { x: velocityX, y: velocityY });
    }

    // Handle target locking to another player
    socket.on("targetPlayer", ({ id }: { id: string }) => {
      const player = players.get(socket.id);

      if (player) {
        const targetPlayer = players.get(id);

        if (targetPlayer) {
          player.targetId = id;
        } else {
          player.targetId = null;
        }
      }
    });
  });
};

export const updatePositions = (
  players: Map<string, { body: Matter.Body; targetId: string | null }>
) => {
  setInterval(() => {
    const positions: Record<
      string,
      { x: number; y: number; rotation: number }
    > = {};

    // Map over players for positions
    players.forEach((player, id) => {
      if (player.targetId) {
        const targetPlayer = players.get(player.targetId);

        if (targetPlayer) {
          // Calculate direction towards the target
          const dx = targetPlayer.body.position.x - player.body.position.x;
          const dy = targetPlayer.body.position.y - player.body.position.y;
          const targetAngle = Math.atan2(dy, dx);

          // Smoothly rotate towards the target
          let angleDifference = targetAngle - player.body.angle;
          while (angleDifference > Math.PI) angleDifference -= Math.PI * 2;
          while (angleDifference < -Math.PI) angleDifference += Math.PI * 2;

          // Apply smooth rotation towards target
          const newAngle = player.body.angle + angleDifference * 0.1;
          Matter.Body.setAngle(player.body, newAngle);
        }
      }

      positions[id] = {
        x: player.body.position.x,
        y: player.body.position.y,
        rotation: player.body.angle,
      };

      // Update clients with new positions
      io.emit("updatePositions", positions);
    });
  }, 100);
};
