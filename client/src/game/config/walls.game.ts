import { socket } from "../../config/socket.config";

// Listen for wall parameters
export const initializeWalls = (scene: Phaser.Scene) => {
  socket.on(
    "walls",
    (
      walls: {
        x: number;
        y: number;
        width: number;
        height: number;
        rotation: number;
      }[]
    ) => {
      // Add walls to scene
      if (walls) {
        walls.forEach((wall) => {
          scene.physics.add
            .staticImage(wall.x, wall.y, "player")
            .setDisplaySize(wall.width, wall.height)
            .setRotation(wall.rotation);
        });
      }
    }
  );
};
