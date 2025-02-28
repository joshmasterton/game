import Matter from "matter-js";
import { io } from "../../app.js";
export const initializePlayers = (world, players, socket, worldHeight, worldWidth) => {
    // Create a Matter.js body for the player
    const player = Matter.Bodies.rectangle(Math.random() * 400, Math.random() * 400, 35, 35, { label: socket.id, frictionAir: 0.1 });
    // Add player physics to world
    Matter.World.add(world, player);
    players.set(socket.id, { body: player });
    // Notify client of active players
    socket.on("ready", () => {
        const positions = {};
        players.forEach((player, id) => {
            positions[id] = { x: player.body.position.x, y: player.body.position.y };
        });
        io.emit("initializePlayers", positions);
    });
};
