const socket = io();
const editorContainer = document.getElementById('editor-container');
const status = document.getElementById('status');
let username;
let connected = false;

function createUser(username)
{
	return {
		name: username,
		ptrX: 0,
		ptrY: 0
	}
}

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
			socket.emit("COMM_JOIN", username);
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