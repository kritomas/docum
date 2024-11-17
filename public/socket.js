const socket = io();
const editorContainer = document.getElementById('editor-container');
const status = document.getElementById('status');
const connectedUsers = document.getElementById('connected-users');
let username;
let users = {};
let connected = false;

function createUser(username)
{
	return {
		name: username,
		ptrX: 0,
		ptrY: 0
	}
}

function updateUsers()
{
	let userText = "";
	let first = true;
	for (let k in users)
	{
		if (!first)
		{
			userText += ", "
		}
		first = false;
		userText += users[k].name;
	}
	connectedUsers.innerText = userText;
};

socket.on("connect", () =>
{
	console.log("Connected to server");
	status.innerText = "Disconnected";
});
socket.on("disconnect", () =>
{
	console.log("Disconnected from server");
	connected = false;
	status.innerText = "Disconnected";
});

socket.on("COMM_DOCUMENT_SET", (incoming) =>
{
	if (connected)
	{
		editorContainer.innerText = incoming;
	}
})

socket.on("COMM_USERS", (incoming) =>
{
	users = incoming;
	updateUsers();
});

editorContainer.addEventListener('input', () =>
{
	if (connected)
	{
		socket.emit('COMM_DOCUMENT_SET', editorContainer.innerText);
	}
});

document.getElementById("join").onclick = () =>
{
	if (!connected)
	{
		username = document.getElementById("username").value;
		if (username)
		{
			socket.emit("COMM_JOIN", createUser(username));
			connected = true;
			status.innerText = "Connected";
		}
	}
};
document.getElementById("leave").onclick = () =>
{
	if (connected)
	{
		socket.emit("COMM_LEAVE");
		connected = false;
		status.innerText = "Disconnected";
	}
};