import express from "express";
import { Server } from "socket.io";
import http from "http";
import * as Diff from "diff";

const PORT = 1337;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = {};
let text = "BRYNDZOVÉ HALUŠKY";

app.use(express.static("/var/docum/public"));

function applyDiff(diff)
{
	let index = 0;
	diff.forEach(part =>
	{
		if (part.removed)
		{
			text = text.slice(0, index) + text.slice(index + part.count);
		}
		else if (part.added)
		{
			text = text.slice(0, index) + part.value + text.slice(index);
		}
		index += part.count;
	});
}

io.on("connection", (socket) =>
{
	console.log("User connected: " + socket.id);

	socket.on("COMM_JOIN", (user) =>
	{
		users[socket.id] = user;
		console.log("User joined: " + socket.id);
		socket.emit("COMM_DOCUMENT_SET", text);
		io.emit("COMM_USERS", users);
	});
	socket.on("COMM_LEAVE", () =>
	{
		delete users[socket.id];
		console.log("User left: " + socket.id);
		io.emit("COMM_USERS", users);
	});
	socket.on("disconnect", () =>
	{
		delete users[socket.id];
		console.log("User disconnected: " + socket.id);
		io.emit("COMM_USERS", users);
	});

	socket.on("COMM_DOCUMENT_SET", (incoming) =>
	{
		text = incoming
		socket.broadcast.emit("COMM_DOCUMENT_SET", text);
	});
	socket.on("COMM_DOCUMENT_UPDATE", (incoming) =>
	{
		applyDiff(incoming);
		socket.broadcast.emit("COMM_DOCUMENT_UPDATE", incoming);
	});
	socket.on("COMM_CURSOR", (position) =>
	{
		users[socket.id].ptrX = position.x;
		users[socket.id].ptrY = position.y;
		io.emit("COMM_USERS", users);
	});
	socket.on("COMM_SELECTION", (selection) =>
	{
		users[socket.id].selectionStart = selection.start;
		users[socket.id].selectionEnd = selection.end;
		io.emit("COMM_USERS", users);
	});
});

server.listen(PORT);
console.log("Server listening at port " + PORT);