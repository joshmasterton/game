import Matter from "matter-js";
import { Socket } from "socket.io";
import { io } from "../../app";

export const initializePlayers = (
  world: Matter.World,
  players: Map<string, { body: Matter.Body }>,
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
    { label: socket.id, frictionAir: 0.1 }
  );

  // Add player physics to world
  Matter.World.add(world, player);
  players.set(socket.id, { body: player });

  // Notify client of active players
  socket.on("ready", () => {
    const positions: Record<string, { x: number; y: number }> = {};

    players.forEach((player, id) => {
      positions[id] = { x: player.body.position.x, y: player.body.position.y };
    });

    io.emit("initializePlayers", positions);
  });
};
