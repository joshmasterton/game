import { useEffect, useRef } from "react";
import { socket } from "../config/socket.config";
import Phaser from "phaser";
import player from "../assets/box.png";
import { movement } from "./movement.game";
import { playersUpdates } from "./player.game";
import { screen } from "./screen.game";
import { configGame } from "./config.game";

export const Game = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.emit("ready");

    const players: Map<string, Phaser.GameObjects.Sprite> = new Map();
    const game = new Phaser.Game(
      configGame(preload, create, update, gameContainerRef)
    );

    function preload(this: Phaser.Scene) {
      this.load.image("player", player);
    }

    function create(this: Phaser.Scene) {
      // Set world and camera bounds
      this.cameras.main.setBounds(0, 0, 2000, 2000);
      this.physics.world.setBounds(0, 0, 2000, 2000);

      // Handle inital array of players
      socket.on(
        "players",
        (
          playersData: { id: string; x: number; y: number; angle: number }[]
        ) => {
          playersUpdates(playersData, players, this, socket);
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
      movement(this, socket, players);
    }

    // Adjust screen size
    screen(players, game);

    // Cleanup socket listeners
    return () => {
      socket.off("players");
      socket.off("move");
      game.destroy(true);
    };
  }, []);

  return <div ref={gameContainerRef} />;
};
