import Matter from "matter-js";
import { io } from "../app";
import { Socket } from "socket.io";

export const initializeAI = (
  world: Matter.World,
  worldWidth: number,
  worldHeight: number,
  players: Map<string, Matter.Body>,
  socket: Socket,
  AICount: number = 50
) => {
  const createAIPlayer = () => {
    const AIPlayer = Matter.Bodies.rectangle(
      Math.random() * worldWidth,
      Math.random() * worldHeight,
      30,
      30,
      { frictionAir: 0.1 }
    );

    // Add the AI player to the world
    Matter.World.add(world, AIPlayer);
    const AIPlayerId = `ai_${Math.random().toString(36).substring(7)}`;
    players.set(AIPlayerId, AIPlayer);
  };

  // Create many AI players
  for (let i = 0; i < AICount; i++) {
    createAIPlayer();
  }

  // Notify client of active AI players
  socket.on("ready", () => {
    io.emit(
      "init",
      Object.fromEntries(
        Array.from(players, ([id, body]) => [
          id,
          { x: body.position.x, y: body.position.y, isAI: true },
        ])
      )
    );
  });
};
