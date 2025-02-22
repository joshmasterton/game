import Matter from "matter-js";
import { io } from "../app";
import { Socket } from "socket.io";

export const initializeMovement = (
  socket: Socket,
  players: Map<string, Matter.Body>,
  AIPlayers: Map<string, Matter.Body>
) => {
  // Update players movement
  setInterval(() => {
    io.emit(
      "update",
      Object.fromEntries(
        Array.from(players, ([id, body]) => [
          id,
          { x: body.position.x, y: body.position.y },
        ])
      )
    );
  }, 100);

  // Update AI players movements
  setInterval(() => {
    io.emit(
      "updateAI",
      Object.fromEntries(
        Array.from(AIPlayers, ([id, body]) => [
          id,
          { x: body.position.x, y: body.position.y },
        ])
      )
    );
  }, 100);

  // Handle player movement
  socket.on("move", (movement: { x: number; y: number }) => {
    const speed = 4;
    if (players.has(socket.id)) {
      const body = players.get(socket.id);
      if (body) {
        let newVelocity = { x: movement.x * speed, y: movement.y * speed };

        const magnitude = Math.sqrt(newVelocity.x ** 2 + newVelocity.y ** 2);
        if (magnitude > 0) {
          newVelocity.x = (newVelocity.x / magnitude) * speed;
          newVelocity.y = (newVelocity.y / magnitude) * speed;
        }

        Matter.Body.setVelocity(body, newVelocity);
      }
    }
  });
};
