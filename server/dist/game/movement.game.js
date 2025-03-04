import Matter from "matter-js";
export const movement = (socket, players) => {
    socket.on("move", (movement) => {
        const player = players.get(socket.id);
        if (player) {
            // Directly update the player's movement
            Matter.Body.setVelocity(player, {
                x: movement.x,
                y: movement.y,
            });
        }
    });
};
