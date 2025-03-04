import { Socket } from "socket.io";
import { io } from "../app";
import Matter from "matter-js";

export const createPlayer = (
  socket: Socket,
  world: Matter.World,
  players: Map<string, Matter.Body>
) => {
  // On client ready
  const spawnX = Math.random() * 400;
  const spawnY = Math.random() * 400;
  const player = Matter.Bodies.rectangle(spawnX, spawnY, 30, 30, {
    frictionAir: 0.1,
    restitution: 1,
  });

  socket.on("ready", () => {
    // Create player body
    Matter.World.add(world, player);
    players.set(socket.id, player);

    // Send players to client
    io.emit(
      "players",
      Array.from(players.entries()).map(([id, body]) => ({
        id,
        x: body.position.x,
        y: body.position.y,
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
