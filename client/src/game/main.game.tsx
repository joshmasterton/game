import { useEffect, useRef } from "react";
import { socket } from "../config/socket.config"; // Assuming socket.config.js handles the socket initialization
import { initializeWalls } from "./create/walls.create";
import Phaser from "phaser";
import player from "../assets/box.png";
import { initializePlayers } from "./create/players.create";
import {
  smoothUpdate,
  targetPlayer,
  updateMovement,
  updatePositions,
} from "./update/movement.update";

export const Game = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.emit("ready");

    // Player maps
    const players = new Map<
      string,
      {
        sprite: Phaser.GameObjects.Sprite;
        healthBar: Phaser.GameObjects.Graphics;
      }
    >();

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      scene: {
        preload,
        create,
        update,
      },
      physics: {
        default: "arcade",
      },
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
      },
      parent: gameContainerRef.current,
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

      // Initialize players
      initializePlayers(this, players);

      // Initialize walls
      initializeWalls(this);

      // Real-time player positions
      updatePositions(players);

			// Target another player
			targetPlayer(this, players);

      // Remove disconnected player
      socket.on("removePlayer", (playerId: string) => {
        if (players.has(playerId)) {
          players.get(playerId)?.sprite.destroy();
          players.get(playerId)?.healthBar.destroy();
          players.delete(playerId);
        }
      });
    }

    function update(this: Phaser.Scene) {
      // Update players movement
      updateMovement(this, players);

      // Smooth movement
      smoothUpdate(players);
    }

    // Resize when window size changes
    const handleResize = () => {
      if (players.size > 0 && socket.id) {
        const player = players.get(socket.id);
        if (player) {
          game.scene.scenes[0].cameras.main.startFollow(
            player.sprite,
            true,
            0.2,
            0.2
          );
        }
      }
      game.scale.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Prevent double-tap to zoom
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", preventZoom, { passive: false });

    // Cleanup socket listeners
    return () => {
      socket.off("init");
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      document.removeEventListener("touchmove", preventZoom);
      game.destroy(true);
    };
  }, []);

  return <div ref={gameContainerRef} />;
};
