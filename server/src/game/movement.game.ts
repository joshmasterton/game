import Matter from "matter-js";
import { Socket } from "socket.io";

export const movement = (socket: Socket, players: Map<string, Matter.Body>) => {
  // Movement updates from player
  socket.on("move", (direction: { x: number; y: number }) => {
    if (players.has(socket.id)) {
      const player = players.get(socket.id);
      if (player) {
        const speed = 2; // Adjust this speed as needed

        // Normalize the direction to prevent faster diagonal movement
        const magnitude = Math.sqrt(
          direction.x * direction.x + direction.y * direction.y
        );
        const normalizedDir =
          magnitude > 0
            ? { x: direction.x / magnitude, y: direction.y / magnitude }
            : { x: 0, y: 0 };

        // Set velocity based on the normalized direction
        const velocity = {
          x: normalizedDir.x * speed,
          y: normalizedDir.y * speed,
        };

        // Apply the new velocity to the player
        Matter.Body.setVelocity(player, velocity);

        // If player is moving, rotate to face direction
        if (velocity.x !== 0 || velocity.y !== 0) {
          // Calculate the angle towards the target direction
          const angle = Math.atan2(normalizedDir.y, normalizedDir.x);
          Matter.Body.setAngle(player, angle);
        }
      }
    }
  });
};
