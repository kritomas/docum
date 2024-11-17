const socket = io();
const editorContainer = document.getElementById('editor-container');
const status = document.getElementById('status');
let username;

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
})

socket.on("COMM_DOCUMENT_SET", (incoming) =>
{
	editorContainer.innerText = incoming;
})

editorContainer.addEventListener('input', () =>
{
	socket.emit('COMM_DOCUMENT_SET', editorContainer.innerText);
});

document.getElementById('join').onclick = () =>
{
	username = document.getElementById("username").value;
	if (username)
	{
		socket.emit("COMM_JOIN", username);
	}
};