import Matter from "matter-js";
import { io } from "../app";
import { createPlayer } from "./player.game";
import { movement } from "./movement.game";
import { update } from "./update.game";

// Create physics world
const engine = Matter.Engine.create();
const world = engine.world;
engine.gravity = { x: 0, y: 0, scale: 0 };

export const mainGame = () => {
  // Store players here
  const players = new Map<string, Matter.Body>();

  // On player connection
  io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    update(engine, players);
    movement(socket, players);

    // On client ready
    socket.on("ready", () => {
      createPlayer(socket, world, players);
    });
  });
};
