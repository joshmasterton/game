import Matter from "matter-js";
import { io } from "../app.js";
export const initializePlayers = (world, players, socket, worldHeight, worldWidth) => {
    // Create a Matter.js body for the player
    const player = Matter.Bodies.rectangle(Math.random() * 400, Math.random() * 400, 35, 35, {
        frictionAir: 0.1,
        label: socket.id,
    });
    // Add player physics to world
    Matter.World.add(world, player);
    players.set(socket.id, { body: player, health: 100 });
    // Notify client of active players
    socket.on("ready", () => {
        io.emit("init", Object.fromEntries(Array.from(players, ([id, player]) => [
            id,
            { x: player.body.position.x, y: player.body.position.y },
        ])));
    });
};
