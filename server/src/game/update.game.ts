import Matter from "matter-js";
import { io } from "../app";

export const update = (
  engine: Matter.Engine,
  players: Map<string, Matter.Body>
) => {
  // Emit updated player positions to all clients
  setInterval(() => {
    Matter.Engine.update(engine, 1000 / 60);

    io.emit(
      "players",
      Array.from(players.entries()).map(([id, body]) => {
        console.log(body.position.x);
        return {
          id,
          x: body.position.x,
          y: body.position.y,
          velocity: body.velocity,
        };
      })
    );
  }, 150);
};
