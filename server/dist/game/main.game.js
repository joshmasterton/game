import Matter from "matter-js";
import { io } from "../app.js";
import { createPlayer } from "./player.game.js";
import { movement } from "./movement.game.js";
import { update } from "./update.game.js";
// Create physics world
const engine = Matter.Engine.create();
const world = engine.world;
engine.gravity = { x: 0, y: 0, scale: 0 };
export const mainGame = () => {
    // Store players here
    const players = new Map();
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
