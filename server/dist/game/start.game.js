import Matter from "matter-js";
import { io } from "../app.js";
import { initializeMovement } from "./movement.game.js";
import { initializePlayers } from "./players.game.js";
import { intializeWalls } from "./walls.game.js";
import { initializeShoot } from "./shoot.game.js";
// Create engine and world
const engine = Matter.Engine.create();
const world = engine.world;
// World proportions
const worldWidth = 2000;
const worldHeight = 2000;
// Turn gravity off
engine.gravity.y = 0;
engine.gravity.x = 0;
export const startGame = () => {
    // Engine update rate
    setInterval(() => {
        Matter.Engine.update(engine, 1000 / 60);
    }, 1000 / 60);
    // Store players here
    const players = new Map();
    const bullets = new Map();
    // On player connection
    io.on("connection", (socket) => {
        console.log(`Player connected: ${socket.id}`);
        // Add walls
        intializeWalls(world, worldWidth, worldHeight, socket);
        // Players
        initializePlayers(world, players, socket, worldHeight, worldWidth);
        // Shooting
        initializeShoot(socket, engine, players, bullets);
        // Movement
        initializeMovement(socket, players);
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
