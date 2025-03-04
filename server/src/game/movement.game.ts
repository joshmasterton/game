import Matter from "matter-js";
import { Socket } from "socket.io";

export const movement = (socket: Socket, players: Map<string, Matter.Body>) => {
  socket.on("move", (movement: { x: number; y: number }) => {
    const player = players.get(socket.id);
    if (player) {
      // Directly update the player's movement
      Matter.Body.setVelocity(player, {
        x: movement.x,
        y: movement.y,
      });
    }
  });
};
