import Matter from "matter-js";
import { io } from "../app";
import { Socket } from "socket.io";

export const initializeMovement = (
  socket: Socket,
  players: Map<string, { body: Matter.Body }>
) => {
  // Update players movement
  setInterval(() => {
    // Check if player is near another player
    players.forEach((_player, id) => {
      if (id !== socket.id) {
        const otherPlayer = players.get(id);
        const userPlayer = players.get(socket.id);

        if (userPlayer && otherPlayer) {
          // Check distance between users
          const distance = Matter.Vector.magnitude(
            Matter.Vector.sub(
              userPlayer.body.position,
              otherPlayer.body.position
            )
          );

          // Rotate body if close enough
          if (distance <= 300) {
            const angleToOtherPlayer = Math.atan2(
              otherPlayer.body.position.y - userPlayer.body.position.y,
              otherPlayer.body.position.x - userPlayer.body.position.x
            );

            Matter.Body.setAngle(
              userPlayer.body,
              angleToOtherPlayer + Math.PI / 2
            );
          }
        }
      }
    });

    io.emit(
      "update",
      Object.fromEntries(
        Array.from(players, ([id, player]) => [
          id,
          {
            x: player.body.position.x,
            y: player.body.position.y,
            rotation: player.body.angle,
          },
        ])
      )
    );
  }, 100);

  // Handle player movement
  socket.on("move", (movement: { x: number; y: number }) => {
    const speed = 6;

    if (players.has(socket.id)) {
      const player = players.get(socket.id);

      if (player) {
        let newVelocity = { x: movement.x * speed, y: movement.y * speed };
        const magnitude = Math.sqrt(newVelocity.x ** 2 + newVelocity.y ** 2);

        if (magnitude > 0) {
          newVelocity.x = (newVelocity.x / magnitude) * speed;
          newVelocity.y = (newVelocity.y / magnitude) * speed;
        }

        // Angle to face
        const angleToMove = Math.atan2(newVelocity.y, newVelocity.x);

        // Update player velocity
        Matter.Body.setVelocity(player.body, newVelocity);
        Matter.Body.setAngle(player.body, angleToMove + Math.PI / 2);
      }

      // Check if player is near another player
      players.forEach((_player, id) => {
        if (id !== socket.id) {
          const otherPlayer = players.get(id);
          const userPlayer = players.get(socket.id);

          if (userPlayer && otherPlayer) {
            // Check distance between users
            const distance = Matter.Vector.magnitude(
              Matter.Vector.sub(
                userPlayer.body.position,
                otherPlayer.body.position
              )
            );

            // Rotate body if close enough
            if (distance <= 300) {
              const angleToOtherPlayer = Math.atan2(
                otherPlayer.body.position.y - userPlayer.body.position.y,
                otherPlayer.body.position.x - userPlayer.body.position.x
              );

              Matter.Body.setAngle(
                userPlayer.body,
                angleToOtherPlayer + Math.PI / 2
              );
            }
          }
        }
      });
    }
  });
};
