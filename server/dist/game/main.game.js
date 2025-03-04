import { io } from "../app.js";
import Matter from "matter-js";
import { movement } from "./movement.game.js";
import { update } from "./update.game.js";
import { createPlayer } from "./player.game.js";
const engine = Matter.Engine.create();
const world = engine.world;
engine.gravity = { x: 0, y: 0, scale: 0 };
export const mainGame = () => {
    // Store players here
    const players = new Map();
    // Broadcast players to all clients
    update(engine, players);
    // On player connection
    io.on("connection", (socket) => {
        console.log(`Player connected: ${socket.id}`);
        // On client ready
        createPlayer(socket, world, players);
        // Movement updates from player
        movement(socket, players);
    });
};
