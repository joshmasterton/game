import Matter from "matter-js";
import { io } from "../app.js";
export const update = (engine, players) => {
    // Emit updated player positions to all clients
    setInterval(() => {
        Matter.Engine.update(engine, 1000 / 60);
        if (players.size === 0)
            return;
        io.emit("players", Array.from(players.entries()).map(([id, body]) => {
            return {
                id,
                x: body.position.x,
                y: body.position.y,
                velocity: body.velocity,
            };
        }));
    }, 150);
};
