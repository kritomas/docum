const socket = io();
const editorContainer = document.getElementById("editor-container");
const status = document.getElementById("status");
const connectedUsers = document.getElementById("connected-users");
const cursors = document.getElementById("cursors");
const selections = document.getElementById("selections");
let username;
let users = {};
let connected = false;
let text = "";

function createUser(username)
{
	return {
		name: username,
		ptrX: 0,
		ptrY: 0,
		selectionStart: -1,
		selectionEnd: -1
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

	let cursorHtml = "";
	for (let k in users)
	{
		cursorHtml += "<div style=\"position: absolute; background: red; width: 5px; height: 5px; left: "
		cursorHtml += users[k].ptrX + "px; top: "
		cursorHtml += users[k].ptrY + "px;\">"
		cursorHtml += "</div>"
	}
	cursors.innerHTML = cursorHtml;

	selections.innerHTML = "";
	for (let k in users)
	{
		if (users[k].selectionStart >= 0 && users[k].selectionEnd >= 0)
		{
			let s = document.createElement("div");
			s.className = "editor";
			s.style.position = "absolute";
			let textToHighlight = editorContainer.innerText;
			let beginning = textToHighlight.substring(0, users[k].selectionStart);
			let highlight = textToHighlight.substring(users[k].selectionStart, users[k].selectionEnd);
			let end = textToHighlight.substring(users[k].selectionEnd);
			let beginSpan = document.createElement("span");
			beginSpan.innerText = beginning;
			let highlightSpan = document.createElement("span");
			highlightSpan.innerText = highlight;
			highlightSpan.style["background-color"] = "yellow";
			let endSpan = document.createElement("span");
			endSpan.innerText = end;
			s.appendChild(beginSpan);
			s.appendChild(highlightSpan);
			s.appendChild(endSpan);

			s.offsetTop = editorContainer.offsetTop;
			s.offsetLeft = editorContainer.offsetLeft;
			s.offsetWidth = editorContainer.offsetWidth;
			s.offsetHeight = editorContainer.offsetHeight;

			selections.appendChild(s);
		}
	}
};

function squashDiff(diff)
{
	for (let index = 0; index < diff.length; ++index)
	{
		if (!diff[index].added)
		{
			delete diff[index].value;
		}
	}
}

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
	editorContainer.innerText = text;
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
	editorContainer.setAttribute("contenteditable", false);
	status.innerText = "Disconnected";
});

socket.on("COMM_DOCUMENT_SET", (incoming) =>
{
	if (connected)
	{
		text = incoming;
		editorContainer.innerText = text;
	}
})
socket.on("COMM_DOCUMENT_UPDATE", (incoming) =>
{
	if (connected)
	{
		applyDiff(incoming);
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
		let diff = Diff.diffChars(text, editorContainer.innerText);
		squashDiff(diff)
		socket.emit('COMM_DOCUMENT_UPDATE', diff);
		text = editorContainer.innerText;
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
			editorContainer.setAttribute("contenteditable", true);
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
		editorContainer.setAttribute("contenteditable", false);
		status.innerText = "Disconnected";
	}
};

editorContainer.addEventListener('mousemove', (event) =>
{
	if (connected)
	{
		socket.emit("COMM_CURSOR", { x: event.clientX, y: event.clientY });
	}
});

document.onselectionchange = () =>
{
	selection = document.getSelection();
	if (connected)
	{
		if (selection.focusNode.parentElement == editorContainer && selection.anchorNode.parentElement == editorContainer && selection.type == "Range")
		{
			socket.emit("COMM_SELECTION", {start: Math.min(selection.anchorOffset, selection.focusOffset), end: Math.max(selection.anchorOffset, selection.focusOffset)});
		}
		else
		{
			socket.emit("COMM_SELECTION", {start: -1, end: -1});
		}
	}
};