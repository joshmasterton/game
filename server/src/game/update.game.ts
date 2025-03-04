import Matter from "matter-js";
import { io } from "../app";

export const update = (
  engine: Matter.Engine,
  players: Map<string, Matter.Body>
) => {
  // Broadcast players to all clients
  setInterval(() => {
    Matter.Engine.update(engine, 1000 / 60);

    // Send players to client
    io.emit(
      "players",
      Array.from(players.entries()).map(([id, body]) => ({
        id,
        x: body.position.x,
        y: body.position.y,
        angle: body.angle,
      }))
    );
  }, 1000 / 60);
};
