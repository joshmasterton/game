import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import { startGame } from "./game/start.game.js";
// Import env variables
dotenv.config();
const { PORT, CLIENT_URL } = process.env;
// Initalize app
const app = express();
const server = createServer(app);
export const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
    },
});
// Default get request
app.get("/", (req, res) => {
    res.status(200).send("Welcome to game");
});
// Initialize game
startGame();
// Listen to server on port
server.listen(PORT, () => {
    console.log(`Listening to server on port: ${PORT}`);
});
