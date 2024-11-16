import express from "express";
import { Server } from "socket.io";
import http from "http";

const PORT = 1337;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) =>
{
	console.log("User connected");
});

server.listen(PORT);
console.log("Server listening at port " + PORT);