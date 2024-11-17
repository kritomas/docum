const socket = io();
const editorContainer = document.getElementById('editor-container');
const status = document.getElementById('status');
let username;

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

socket.emit("COMM_JOIN", "kritomas");