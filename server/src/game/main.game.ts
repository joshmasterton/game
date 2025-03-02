import Matter from "matter-js";
import { io } from "../app";
import { intializeWalls } from "./create/walls.create";
import { initializePlayers } from "./create/players.create";
import { updateMovement, updatePositions } from "./update/movement.update";

// Create engine and world
const engine = Matter.Engine.create();
const world = engine.world;

// World proportions
const worldWidth = 2000;
const worldHeight = 2000;

// Turn gravity off
engine.gravity.y = 0;
engine.gravity.x = 0;

export const mainGame = () => {
  // Engine update rate
  setInterval(() => {
    Matter.Engine.update(engine, 1000 / 60);
  }, 1000 / 60);

  // Store players here
  const players = new Map<
    string,
    { body: Matter.Body; targetId: string | null }
  >();

  const lastPositions = new Map<
    string,
    { x: number; y: number; rotation: number }
  >();

  // On player connection
  io.on("connection", (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Add walls
    intializeWalls(world, worldWidth, worldHeight, socket);

    // Players
    initializePlayers(world, players, socket, worldHeight, worldWidth);

    // Movement
    updateMovement(socket, players);

    // Real-time user positions
    updatePositions(players, lastPositions);

    // Player disconnected
    socket.on("disconnect", () => {
      console.log(`Player disconnected: ${socket.id}`);

      // Remove player if disconnected
      const player = players.get(socket.id);
      if (player) {
        Matter.World.remove(world, player.body);
        players.delete(socket.id);

        io.emit("removePlayer", socket.id);
      }
    });
  });
};
