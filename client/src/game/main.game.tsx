import { useEffect, useRef } from "react";
import { socket } from "../config/socket.config"; // Assuming socket.config.js handles the socket initialization
import Phaser from "phaser";
import player from "../assets/box.png";
import ai from "../assets/box1.png";

export const Game = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.emit("ready");

    const players = new Map<string, Phaser.GameObjects.Sprite>();
    const positions = new Map<string, { x: number; y: number }>();

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 400,
      height: 400,
      scene: {
        preload,
        create,
        update,
      },
      physics: {
        default: "arcade",
      },
    };

    const game = new Phaser.Game(config);

    function preload(this: Phaser.Scene) {
      this.load.image("player", player);
      this.load.image("AI", ai);
    }

    function create(this: Phaser.Scene) {
      // Set world and camera bounds
      this.cameras.main.setBounds(0, 0, 2000, 2000);
      this.physics.world.setBounds(0, 0, 2000, 2000);

      // Client is ready to emit to server
      socket.emit("ready");

      // Listen for the init event after connection
      socket.on(
        "init",
        (data: { [id: string]: { x: number; y: number; isAI: boolean } }) => {
          // Create sprite if no player or set position if player exists
          Object.entries(data).forEach(([id, { x, y, isAI }]) => {
            if (!players.has(id)) {
              const sprite = this.physics.add.sprite(
                x,
                y,
                isAI ? "AI" : "player"
              );
              const scaleX = 30 / sprite.width;
              const scaleY = 30 / sprite.height;

              sprite.setScale(scaleX, scaleY);

              players.set(id, sprite);
              positions.set(id, { x, y });

              // Make camera follow player
              if (id === socket.id) {
                this.cameras.main.startFollow(sprite, true, 0.25, 0.25);
              }
            } else {
              players.get(id)?.setPosition(x, y);
              positions.set(id, { x, y });
            }
          });
        }
      );

      // Handle player movement updates
      socket.on(
        "update",
        (data: { [id: string]: { x: number; y: number } }) => {
          Object.entries(data).forEach(([id, { x, y }]) => {
            if (players.has(id)) {
              positions.set(id, { x, y });
            }
          });
        }
      );

      // Handle AI player movement updates
      socket.on(
        "updateAI",
        (data: { [id: string]: { x: number; y: number } }) => {
          Object.entries(data).forEach(([id, { x, y }]) => {
            if (players.has(id)) {
              positions.set(id, { x, y });
            }
          });
        }
      );

      // Listen for wall parameters
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
              this.physics.add
                .staticImage(wall.x, wall.y, "player")
                .setDisplaySize(wall.width, wall.height)
                .setRotation(wall.rotation);
            });
          }
        }
      );

      // Remove disconnected player
      socket.on("removePlayer", (playerId: string) => {
        if (players.has(playerId)) {
          players.get(playerId)?.destroy();
          players.delete(playerId);
        }
      });
    }

    function update(this: Phaser.Scene) {
      // Interpolate for smooth movement
      players.forEach((playerSprite, id) => {
        const targetPosition = positions.get(id);
        if (targetPosition) {
          playerSprite.x = Phaser.Math.Linear(
            playerSprite.x,
            targetPosition.x,
            0.1
          );
          playerSprite.y = Phaser.Math.Linear(
            playerSprite.y,
            targetPosition.y,
            0.1
          );
        }
      });

      // Update player movement
      const cursors = this.input.keyboard?.createCursorKeys();
      const pointer = this.input.activePointer;
      const movement = { x: 0, y: 0 };

      // Update movement on click(desktop)
      if (cursors?.up.isDown) movement.y = -1;
      if (cursors?.down.isDown) movement.y = 1;
      if (cursors?.left.isDown) movement.x = -1;
      if (cursors?.right.isDown) movement.x = 1;

      // Update player movement on tap(mobile)
      if (pointer.isDown) {
        if (socket.id) {
          const player = players.get(socket.id);

          if (player) {
            const currentPosition = player.getCenter();

            // Adjust the pointer based on camera position
            const adjustedPointerX = pointer.x + this.cameras.main.scrollX;
            const adjustedPointerY = pointer.y + this.cameras.main.scrollY;

            const angle = Phaser.Math.Angle.Between(
              currentPosition?.x,
              currentPosition?.y,
              adjustedPointerX,
              adjustedPointerY
            );
            const distance = Phaser.Math.Distance.Between(
              currentPosition.x,
              currentPosition.y,
              adjustedPointerX,
              adjustedPointerY
            );

            movement.x = Math.cos(angle) * (distance / 10);
            movement.y = Math.sin(angle) * (distance / 10);
          }
        }
      }

      if (movement.x !== 0 || movement.y !== 0) {
        socket.emit("move", movement);
      }
    }

    // Cleanup socket listeners
    return () => {
      socket.off("init");
      game.destroy(true);
    };
  }, []);

  return <div ref={gameContainerRef} />;
};
