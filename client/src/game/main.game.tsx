import { useEffect, useRef } from "react";
import { socket } from "../config/socket.config";
import Phaser from "phaser";
import player from "../assets/box.png";
import { screen } from "./screen.game";
import { configGame } from "./config.game";
import { createPlayer } from "./player.game";
import { movement } from "./movement.game";

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

      // Add players to scene
      createPlayer(socket, this, players);
    }

    function update(this: Phaser.Scene) {
      movement(this, players, socket);
    }

    // Adjust screen size
    screen(players, game);

    // Cleanup socket listeners
    return () => {
      socket.off("players");
      socket.off("removePlayer");
      game.destroy(true);
    };
  }, []);

  return <div ref={gameContainerRef} />;
};
