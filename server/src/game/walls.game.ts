import Matter from "matter-js";
import { Socket } from "socket.io";

export const intializeWalls = (
  world: Matter.World,
  worldWidth: number,
  worldHeight: number,
  socket: Socket,
  randomWalls: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[]
) => {
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

  const allWalls = [...walls, ...randomWalls];

  // Add walls to world
  allWalls.forEach((wall) => {
    const wallBody = Matter.Bodies.rectangle(
      wall.x,
      wall.y,
      wall.width,
      wall.height,
      {
        isStatic: true,
      }
    );

    Matter.World.add(world, wallBody);
  });

  // Send wall parameters to client
  socket.on("ready", () => {
    socket.emit("walls", allWalls);
  });
};

// Random walls
export const generateRandomWalls = (
  worldWidth: number,
  worldHeight: number,
  gridSize: number = 2, // Number of grid cells in the row/column
  wallThickness: number = 20, // Wall thickness
  minGapSize: number = 100, // Minimum gap size for passage
  maxGapSize: number = 150 // Maximum gap size for passage
) => {
  const randomWalls = [];
  const cellWidth = worldWidth / gridSize;
  const cellHeight = worldHeight / gridSize;

  // Randomize wall placement for each grid cell
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = col * cellWidth + cellWidth / 2;
      const y = row * cellHeight + cellHeight / 2;

      // Randomize whether we place a wall for this grid edge
      // Horizontal top wall
      if (Math.random() < 0.8) {
        const gapSize = Math.random() * (maxGapSize - minGapSize) + minGapSize; // Randomize gap size
        const wallWidth = cellWidth - gapSize; // Wall width based on gap size
        randomWalls.push({
          x: x,
          y: y - cellHeight / 2, // Top edge of the cell
          width: wallWidth,
          height: wallThickness,
        });
      }

      // Horizontal bottom wall
      if (Math.random() < 0.8) {
        const gapSize = Math.random() * (maxGapSize - minGapSize) + minGapSize; // Randomize gap size
        const wallWidth = cellWidth - gapSize; // Wall width based on gap size
        randomWalls.push({
          x: x,
          y: y + cellHeight / 2, // Bottom edge of the cell
          width: wallWidth,
          height: wallThickness,
        });
      }

      // Vertical left wall
      if (Math.random() < 0.8) {
        const gapSize = Math.random() * (maxGapSize - minGapSize) + minGapSize; // Randomize gap size
        const wallHeight = cellHeight - gapSize; // Wall height based on gap size
        randomWalls.push({
          x: x - cellWidth / 2, // Left edge of the cell
          y: y,
          width: wallThickness,
          height: wallHeight,
        });
      }

      // Vertical right wall
      if (Math.random() < 0.8) {
        const gapSize = Math.random() * (maxGapSize - minGapSize) + minGapSize; // Randomize gap size
        const wallHeight = cellHeight - gapSize; // Wall height based on gap size
        randomWalls.push({
          x: x + cellWidth / 2, // Right edge of the cell
          y: y,
          width: wallThickness,
          height: wallHeight,
        });
      }
    }
  }

  return randomWalls;
};
