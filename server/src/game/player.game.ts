import Matter from "matter-js";
import { Socket } from "socket.io";
import { io } from "../app";

export const createPlayer = (
  socket: Socket,
  world: Matter.World,
  players: Map<string, Matter.Body>
) => {
  // Create a Matter.js body
  const player = Matter.Bodies.rectangle(400, 400, 30, 30, {
    restitution: 1,
    frictionAir: 0.1,
  });

  // On client ready
  socket.on("ready", () => {
    // Add player to world
    Matter.World.add(world, player);

    // Add new player to server
    players.set(socket.id, player);

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
  });

  // Player disconnected
  socket.on("disconnect", () => {
    Matter.World.remove(world, player);
    players.delete(socket.id);
    io.emit("removePlayer", socket.id);
  });
};
