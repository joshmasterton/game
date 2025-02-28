import Matter from "matter-js";
export const intializeWalls = (world, worldWidth, worldHeight, socket) => {
    // Walls parameters
    const walls = [
        {
            x: worldWidth / 2,
            y: 0,
            width: worldWidth,
            height: 20,
        },
        {
            x: worldWidth / 2,
            y: worldHeight,
            width: worldWidth,
            height: 20,
        },
        {
            x: 0,
            y: worldHeight / 2,
            width: 20,
            height: worldHeight,
        },
        {
            x: worldWidth,
            y: worldHeight / 2,
            width: 20,
            height: worldHeight,
        },
    ];
    // Add walls to world
    walls.forEach((wall) => {
        const wallBody = Matter.Bodies.rectangle(wall.x, wall.y, wall.width, wall.height, {
            isStatic: true,
        });
        Matter.World.add(world, wallBody);
    });
    // Send wall parameters to client
    socket.on("ready", () => {
        socket.emit("walls", walls);
    });
};
