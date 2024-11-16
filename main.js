import express from "express";
import { Server } from "socket.io";
import http from "http";

const PORT = 1337;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = {};
let text = "BRYNDZOVÉ HALUŠKY";

app.use(express.static('public'));

io.on("connection", (socket) =>
{
	console.log("User connected: " + socket.id);

	socket.on("COMM_JOIN", (username) =>
	{
		users[socket.id] = username;
		socket.emit("COMM_DOCUMENT_SET", text);
		io.emit("COMM_USERS", users);
	});
});

server.listen(PORT);
console.log("Server listening at port " + PORT);