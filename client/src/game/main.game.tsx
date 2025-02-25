import { useEffect, useRef } from "react";
import { socket } from "../config/socket.config"; // Assuming socket.config.js handles the socket initialization
import Phaser from "phaser";
import player from "../assets/box.png";
import { movePlayer } from "./player/movement.player";
import { shoot } from "./shoot.game";
import { health, updateHealthBar } from "./player/health.player";

export const Game = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.emit("ready");

    // Player maps
    const players = new Map<
      string,
      {
        sprite: Phaser.GameObjects.Sprite;
        health: number;
        healthBar: Phaser.GameObjects.Graphics;
      }
    >();
    const positions = new Map<string, { x: number; y: number }>();
    const rotations = new Map<string, number>();

    // Bullet map
    const bullets = new Map<number, Phaser.GameObjects.Sprite>();

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
    }

    function create(this: Phaser.Scene) {
      // Set world and camera bounds
      this.cameras.main.setBounds(0, 0, 2000, 2000);
      this.physics.world.setBounds(0, 0, 2000, 2000);

      // Client is ready to emit to server
      socket.emit("ready");

      // Listen for the init event after connection
      socket.on("init", (data: { [id: string]: { x: number; y: number } }) => {
        // Create sprite if no player or set position if player exists
        Object.entries(data).forEach(([id, { x, y }]) => {
          if (!players.has(id)) {
            const sprite = this.physics.add.sprite(x, y, "player");
            const scaleX = 35 / sprite.width;
            const scaleY = 35 / sprite.height;

            sprite.setScale(scaleX, scaleY);
            sprite.setData("id", id);

            // Create health bar
            const healthBar = this.add.graphics();
            healthBar.setScale(35 / sprite.width, 35 / sprite.height);
            updateHealthBar(healthBar, x, y, 100);

            // Set player in map and position map
            players.set(id, { sprite: sprite, health: 100, healthBar });
            positions.set(id, { x, y });

            // Make camera follow player
            if (id === socket.id) {
              this.cameras.main.startFollow(sprite, true, 0.25, 0.25);
            }
          } else {
            players.get(id)?.sprite.setPosition(x, y);
            positions.set(id, { x, y });
          }
        });
      });

      // Handle player movement updates
      socket.on(
        "update",
        (data: {
          [id: string]: { x: number; y: number; rotation: number };
        }) => {
          Object.entries(data).forEach(([id, { x, y, rotation }]) => {
            if (players.has(id)) {
              const player = players.get(id);
              if (player) {
                positions.set(id, { x, y });
                rotations.set(id, rotation);
              }
            }
          });
        }
      );

      // Add shoot mechanic
      shoot(players, bullets, this);

      // Health
      health(players);

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
          players.get(playerId)?.sprite.destroy();
          players.delete(playerId);
        }
      });
    }

    function update(this: Phaser.Scene) {
      // Player movement
      movePlayer(this, players, positions, rotations);
    }

    // Cleanup socket listeners
    return () => {
      socket.off("init");
      game.destroy(true);
    };
  }, []);

  return <div ref={gameContainerRef} />;
};
