import Matter from "matter-js";
import { io } from "../app";
import { Socket } from "socket.io";

export const initializePlayers = (
  world: Matter.World,
  players: Map<string, Matter.Body>,
  socket: Socket,
  worldHeight: number,
  worldWidth: number
) => {
  // Create a Matter.js body for the player
  const player = Matter.Bodies.rectangle(
    Math.random() * worldWidth,
    Math.random() * worldHeight,
    30,
    30,
    {
      frictionAir: 0.1,
    }
  );

  // Add player physics to world
  Matter.World.add(world, player);
  players.set(socket.id, player);

  // Notify client of active players
  socket.on("ready", () => {
    io.emit(
      "init",
      Object.fromEntries(
        Array.from(players, ([id, body]) => [
          id,
          { x: body.position.x, y: body.position.y, isAI: false },
        ])
      )
    );
  });
};
