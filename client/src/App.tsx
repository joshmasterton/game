import { useEffect, useState } from "react";
import { socket } from "./config/socket.config";
import { Game } from "./game/main.game";

export const App = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  // Initalize socket
  useEffect(() => {
    setIsConnected(socket.connected);

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return (
    <div>
      <h1>Welcome to game</h1>
      <div>{isConnected ? "Connected" : "Disconnected"}</div>
      {isConnected ? <Game /> : undefined}
    </div>
  );
};
