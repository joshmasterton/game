import Matter from "matter-js";
import { io } from "../app";
import { Socket } from "socket.io";

export const initializePlayers = (
  world: Matter.World,
  players: Map<string, { body: Matter.Body; health: number }>,
  socket: Socket,
  worldHeight: number,
  worldWidth: number
) => {
  // Create a Matter.js body for the player
  const player = Matter.Bodies.rectangle(
    Math.random() * 400,
    Math.random() * 400,
    35,
    35,
    {
      frictionAir: 0.1,
      label: socket.id,
    }
  );

  // Add player physics to world
  Matter.World.add(world, player);
  players.set(socket.id, { body: player, health: 100 });

  // Notify client of active players
  socket.on("ready", () => {
    io.emit(
      "init",
      Object.fromEntries(
        Array.from(players, ([id, player]) => [
          id,
          { x: player.body.position.x, y: player.body.position.y },
        ])
      )
    );
  });
};
